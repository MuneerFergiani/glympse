import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLoginStore } from "@/store/login";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { MinusIcon, PlusIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

export const formSchema = z
  .object({
    studyName: z.string().min(3),
    studyDescription: z.string().min(3),
    studyHypothesis: z.string().min(3),
    dataAnalysisMethod: z.string().min(3),
    surveyQuestions: z
      .array(z.object({ question: z.string().min(3) }))
      .min(1, "There must be at least one question")
      .refine((arg) => {
        const questions = arg.map((q) => q.question);
        return new Set(questions).size === questions.length;
      }, "Questions must be unique"),
    minimumParticipants: z
      .string()
      .regex(/^[0-9]+?$/, "Please enter a number, not text")
      .transform<number>((arg) => parseFloat(arg))
      .refine((arg) => arg > 0, "Please enter a number more than 0")
      .refine(
        (arg) => arg <= 100_000_000,
        "Please enter a number less than 100,000,000",
      ),
    maximumParticipants: z
      .string()
      .regex(/^[0-9]+?$/, "Please enter a number, not text")
      .transform<number>((arg) => parseFloat(arg))
      .refine((arg) => arg > 0, "Please enter a number more than 0")
      .refine(
        (arg) => arg <= 100_000_000,
        "Please enter a number less than 100,000,000",
      ),
    timeLimit: z
      .string()
      .regex(/^[0-9]+?$/, "Please enter a number, not text")
      .transform<number>((arg) => parseFloat(arg))
      .refine((arg) => arg > 1, "Please enter a number more than 1")
      .refine(
        (arg) => arg <= 100_000_000,
        "Please enter a number less than 100,000,000",
      ),
    tags: z.array(z.object({ tag: z.string().min(3) })).refine((arg) => {
      const tags = arg.map((q) => q.tag);
      return new Set(tags).size === tags.length;
    }, "Tags must be unique"),
    proposingAccount: z.string().min(3),
  })
  .superRefine((args, ctx) => {
    if (args.minimumParticipants > args.maximumParticipants) {
      ctx.addIssue({
        path: ["minimumParticipants"],
        code: z.ZodIssueCode.custom,
        message: "Minimum more than the maximum",
      });
      ctx.addIssue({
        path: ["maximumParticipants"],
        code: z.ZodIssueCode.custom,
        message: "Maximum less than the minimum",
      });
    }
  });

export default function NewStudy({ children }: { children: ReactNode }) {
  // control the open/close state
  const [open, setOpen] = useState(false);

  // form state
  const { loginState } = useLoginStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studyName: "",
      studyDescription: "",
      studyHypothesis: "",
      dataAnalysisMethod: "",
      surveyQuestions: [{ question: "" }],
      // @ts-ignore
      minimumParticipants: "",
      // @ts-ignore
      maximumParticipants: "",
      // @ts-ignore
      timeLimit: "",
      tags: [],

      // set login info
      proposingAccount: (loginState.loggedIn && loginState.account) || "",
    },
  });

  // hooks
  const proposeStudy = trpc.proposeStudy.useMutation();

  // survey questions
  const questionsArray = useFieldArray({
    control: form.control,
    name: "surveyQuestions",
  });

  // survey tags
  const tagsArray = useFieldArray({
    control: form.control,
    name: "tags",
  });

  // handle cancel
  function onCancel() {
    form.reset();
    setOpen(false);
  }

  // handle submitting
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // send to server
    const result = await proposeStudy.mutateAsync({
      studyName: values.studyName,
      studyDescription: values.studyDescription,
      studyHypothesis: values.studyHypothesis,
      dataAnalysisMethod: values.dataAnalysisMethod,
      surveyQuestions: values.surveyQuestions,
      minimumParticipants: values.minimumParticipants.toString(),
      maximumParticipants: values.maximumParticipants.toString(),
      timeLimit: values.timeLimit.toString(),
      tags: values.tags,
      proposingAccount: values.proposingAccount,
    });

    // on success
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[calc(100%-32px)] sm:max-w-[calc(100%-128px)] flex flex-col">
        <DialogHeader>
          <DialogTitle>Propose a New Study</DialogTitle>
          <DialogDescription>
            To propose a new study, you need to first fill out a few things
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex-1 flex flex-col gap-4 overflow-hidden"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex-1 flex flex-col gap-8 min-h-0 overflow-auto">
              {/* Study Name */}
              <FormField
                control={form.control}
                name="studyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Example Study Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name of your study.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Study Description */}
              <FormField
                control={form.control}
                name="studyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example Study Description"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the description of your study.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Study Hypothesis */}
              <FormField
                control={form.control}
                name="studyHypothesis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Hypothesis</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example Study Hypothesis"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the hyposthesis of your study.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data analysis method */}
              <FormField
                control={form.control}
                name="dataAnalysisMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Analysis Method</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example Data Analysis Method"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your method of analysing the collected data.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Survey Questions */}
              <FormField
                control={form.control}
                name="surveyQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Survey Questions</FormLabel>
                    <FormDescription>
                      These questions should be of a YES/NO format.
                    </FormDescription>
                    {questionsArray.fields.map((item, index) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        // @ts-ignore
                        name={`surveyQuestions[${index}].question`}
                        defaultValue=""
                        render={(props) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center">
                                {/* @ts-ignore */}
                                <Input
                                  placeholder="Example Question"
                                  {...props.field}
                                />

                                {/* Remove question */}
                                {index !== 0 ? (
                                  <Button
                                    variant="destructive"
                                    className="rounded-lg p-0 w-10 h-10 ml-2"
                                    onClick={() => {
                                      questionsArray.remove(index);
                                    }}
                                  >
                                    <MinusIcon />
                                  </Button>
                                ) : null}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    {/* Add question */}
                    <Button
                      variant="default"
                      className="rounded-lg p-0 w-10 h-10"
                      onClick={() => {
                        questionsArray.append({ question: "" });
                      }}
                    >
                      <PlusIcon />
                    </Button>

                    {/* Survey questions errors needs special handling */}
                    {typeof form.getFieldState("surveyQuestions").error
                      ?.message !== "undefined" ? (
                      <FormMessage />
                    ) : null}
                  </FormItem>
                )}
              />

              <div className="flex gap-4 w-full flex-wrap">
                {/* Minimum Participants */}
                <FormField
                  control={form.control}
                  name="minimumParticipants"
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[316px]">
                      <FormLabel>Minimum Number of Participants</FormLabel>
                      <FormControl>
                        <Input placeholder="i.e. 100" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is minimum number of participants needed for your
                        study to go ahead.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Maximum Participants */}
                <FormField
                  control={form.control}
                  name="maximumParticipants"
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[316px]">
                      <FormLabel>Maximum Number of Participants</FormLabel>
                      <FormControl>
                        <Input placeholder="i.e. 100" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is maximum number of participants needed for your
                        study to go ahead.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Time limit */}
              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit for Your Study (Hours)</FormLabel>
                    <FormControl>
                      <Input placeholder="i.e. 100" {...field} />
                    </FormControl>
                    <FormDescription>
                      If you don&apos;t get the desired number of participants
                      within this timeframe, the study will be cancelled.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormDescription>
                      These are used for search optimisation
                    </FormDescription>
                    {tagsArray.fields.map((item, index) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        // @ts-ignore
                        name={`tags[${index}].tag`}
                        defaultValue=""
                        render={(props) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center">
                                {/* @ts-ignore */}
                                <Input
                                  placeholder="Example Tag"
                                  {...props.field}
                                />

                                {/* Remove tag */}
                                <Button
                                  variant="destructive"
                                  className="rounded-lg p-0 w-10 h-10 ml-2"
                                  onClick={() => {
                                    tagsArray.remove(index);
                                  }}
                                >
                                  <MinusIcon />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    {/* Add tag */}
                    <Button
                      variant="default"
                      className="rounded-lg p-0 w-10 h-10"
                      onClick={() => {
                        tagsArray.append({ tag: "" });
                      }}
                    >
                      <PlusIcon />
                    </Button>

                    {/* tags errors needs special handling */}
                    {typeof form.getFieldState("tags").error?.message !==
                    "undefined" ? (
                      <FormMessage />
                    ) : null}
                  </FormItem>
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="w-64"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-64">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
