import { Button } from "@/components/ui/button";
import { ChevronRightIcon, AlarmClockIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import AppLayout from "@/layouts/app-layout";
import { LayoutPage } from "@/layouts/root-layout";
import requestInterceptorRunner from "@/request-interceptors/request-interceptor-runner";
import { GetServerSideProps } from "next";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useLoginStore } from "@/store/login";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context,
) =>
  await requestInterceptorRunner<HomeProps>(context, [], async () => {
    // Do data fetching for home page with GraphQL

    // Return this data as server-side props
    return { props: {} };
  });

export interface HomeProps {}

const Home: LayoutPage = () => {
  const getStudiesToJoin = trpc.getStudiesToJoin.useQuery();

  console.log(getStudiesToJoin.data);

  return (
    <div className="w-full h-full px-6 py-2 overflow-clip lg:px-16">
      <ScrollArea className="w-full h-full min-h-0">
        <div className="w-full h-full px-2 py-2 flex flex-col ">
          {/* Your studies section */}
          <section className="flex flex-col gap-8 h-fit">
            <div>
              <h1 className="text-5xl leading-[64px] font-medium mt-8">
                Your Studies
              </h1>
              <p className=" text-lg">
                You&apos;ve offered to participate in the following studies.
                Your responses will be anonymous and you will be compensated for
                your responses once the study is complete. You will be asked to
                answer a questionnaire once the participant threshold has been
                met.
              </p>
            </div>

            {/* Condirmation section */}
            <div>
              <h1 className="text-3xl font-medium mb-4">
                Awaiting Your Confirmation
              </h1>
              <ul className="flex flex-col gap-4">
                <CardComponent />
                <CardComponent />
                <CardComponent />
              </ul>
            </div>

            {/* Condirmation section */}
            <div>
              <h1 className="text-3xl font-medium mb-4">Ready to Vote</h1>
              <ul className="flex flex-col gap-4">
                <CardComponent />
                <CardComponent />
                <CardComponent />
              </ul>
            </div>
          </section>

          {/* Join a study section */}
          <section className="flex flex-col gap-8 h-fit">
            <div>
              <h1 className="text-5xl leading-[64px] font-medium mt-8">
                Join a Study
              </h1>
              <p className=" text-lg">
                You are free to participate in any of the given studies, so long
                as you meet the study criterion. Your responses will be
                anonymous, and some studies will compensate you for
                participating. You will be asked to take an honesty pledge.
              </p>
            </div>

            <ul className="flex flex-col gap-4">
              {getStudiesToJoin.data?.map((study, index) => (
                <li key={index}>
                  <JoinStudyForm study={study} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

// JOIN STUDY FORM
function JoinStudyForm({
  study,
}: {
  study: {
    id: number;
    studyName: string;
    studyDescription: string;
    studyHypothesis: string;
    dataAnalysisMethod: string;
    questions: {
      id: number;
      question: string;
    }[];
    minimumParticipants: number;
    maximumParticipants: number;
    createdUnixTimestamp: number;
    expiryUnixTimestamp: number;
    tags: string[];
    proposingAccountId: number;
  };
}) {
  // hooks
  const [open, setOpen] = useState(false);
  const { loginState } = useLoginStore();
  const useJoinStudy = trpc.joinStudy.useMutation();
  const router = useRouter();

  // handle cancel
  function onCancel() {
    setOpen(false);
  }

  // handle submitting
  async function onJoin() {
    // send to server
    useJoinStudy.mutate({
      account: (loginState.loggedIn && loginState.account) || "",
      studyProposalId: study.id,
    });

    // on success
    setOpen(false);
    router.reload();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Card button */}
      <DialogTrigger asChild>
        <Card className="cursor-pointer flex flex-col gap-4 min-w-fit h-fit pt-3 pb-5 px-5 bg-secondary shadow-md">
          <div className="flex justify-between items-center w-full h-fit ">
            <h3 className="text-lg font-medium">{study.studyName}</h3>
            <ChevronRightIcon className="w-7 h-7 stroke-muted-foreground" />
          </div>
          <p>{study.studyDescription}</p>
          <div className="flex w-full min-w-fit h-6 gap-2">
            {study.tags?.[0] ? (
              <Badge className="bg-orange-400 hover:bg-orange-400">
                {study.tags[0]}
              </Badge>
            ) : null}
            {study.tags?.[1] ? (
              <Badge className="bg-purple-500 hover:bg-purple-500">
                {study.tags[1]}
              </Badge>
            ) : null}
            {study.tags?.[2] ? (
              <Badge className="g-blue-600 hover:bg-blue-600">
                {study.tags[2]}
              </Badge>
            ) : null}

            {/* Separator */}
            <span className="flex-1" />

            <Badge className="min-w-fit" variant="destructive">
              <AlarmClockIcon className="w-4 mr-2" />
              {Math.floor(
                (study.expiryUnixTimestamp - Date.now()) / (1000 * 60 * 60),
              )}{" "}
              Hours To Join
            </Badge>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100%-32px)] sm:max-w-[calc(100%-128px)] flex flex-col">
        <DialogHeader>
          <DialogTitle>Join a Study</DialogTitle>
          <DialogDescription>
            Here is the details of the study you will be joining
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 flex flex-col gap-8 min-h-0 overflow-auto">
            <div>
              <h3 className="text-lg">
                <b>Study:</b> <i>{study.studyName}</i>
              </h3>
              <div className="flex gap-4 text-muted-foreground text-sm">
                <p>
                  N = {study.minimumParticipants} to {study.maximumParticipants}
                </p>
                <p>
                  Created: {new Date(study.createdUnixTimestamp).toDateString()}
                </p>
                <p>
                  Expiring in{" "}
                  {Math.floor(
                    (study.expiryUnixTimestamp - Date.now()) / (1000 * 60 * 60),
                  )}{" "}
                  hours
                </p>
              </div>
              <p className="mt-1">{study.studyDescription}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold">Hypothesis</h3>
              <p className="mt-1">{study.studyHypothesis}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold">Data Analysis Method</h3>
              <p className="mt-1">{study.dataAnalysisMethod}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold">Questions</h3>
              {study.questions.map((q, i) => (
                <p key={i} className="mt-1">
                  {q.question}
                </p>
              ))}
            </div>
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
            <Button onClick={onJoin} className="w-64">
              Join
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// SUBMIT ANSWER FUNCTIONS
const sumbitAnswersSchema = z.object({
  participantAccount: z.string().min(3),
  proposedStudyId: z.number(),
  answers: z
    .array(
      z.object({
        proposedStudyQuestionId: z.number(),
        question: z.string(),
        result: z.boolean(),
      }),
    )
    .min(1),
});
function SubmitAnswersForm({
  study,
}: {
  study: {
    id: number;
    studyName: string;
    studyDescription: string;
    studyHypothesis: string;
    dataAnalysisMethod: string;
    questions: {
      id: number;
      question: string;
    }[];
    minimumParticipants: number;
    maximumParticipants: number;
    createdUnixTimestamp: number;
    expiryUnixTimestamp: number;
    tags: string[];
    proposingAccountId: number;
  };
}) {
  // control the open/close state
  const [open, setOpen] = useState(false);

  // form state
  const { loginState } = useLoginStore();
  const form = useForm<z.infer<typeof sumbitAnswersSchema>>({
    resolver: zodResolver(sumbitAnswersSchema),
    defaultValues: {
      participantAccount: (loginState.loggedIn && loginState.account) || "",
      proposedStudyId: study.id,
      answers: study.questions.map((q) => ({
        proposedStudyQuestionId: q.id,
        question: q.question,
        result: false,
      })),
    },
  });

  // answers array
  const answersArray = useFieldArray({
    control: form.control,
    name: "answers",
  });

  // handle cancel
  function onCancel() {
    form.reset();
    setOpen(false);
  }

  // handle submitting
  async function onSubmit(values: z.infer<typeof sumbitAnswersSchema>) {
    // send to server
    console.log(values);

    // on success
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Card button */}
      <DialogTrigger asChild>
        <Card className="cursor-pointer flex flex-col gap-4 min-w-fit h-fit pt-3 pb-5 px-5 bg-secondary shadow-md">
          <div className="flex justify-between items-center w-full h-fit ">
            <h3 className="text-lg font-medium">{study.studyName}</h3>
            <ChevronRightIcon className="w-7 h-7 stroke-muted-foreground" />
          </div>
          <p>{study.studyDescription}</p>
          <div className="flex w-full min-w-fit h-6 gap-2">
            {study.tags?.[0] ? (
              <Badge className="bg-orange-400 hover:bg-orange-400">
                {study.tags[0]}
              </Badge>
            ) : null}
            {study.tags?.[1] ? (
              <Badge className="bg-purple-500 hover:bg-purple-500">
                {study.tags[1]}
              </Badge>
            ) : null}
            {study.tags?.[2] ? (
              <Badge className="g-blue-600 hover:bg-blue-600">
                {study.tags[2]}
              </Badge>
            ) : null}

            {/* Separator */}
            <span className="flex-1" />

            <Badge className="min-w-fit" variant="destructive">
              <AlarmClockIcon className="w-4 mr-2" />
              {Math.floor(
                (study.expiryUnixTimestamp - Date.now()) / (1000 * 60 * 60),
              )}{" "}
              Hours To Join
            </Badge>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100%-32px)] sm:max-w-[calc(100%-128px)] flex flex-col">
        <DialogHeader>
          <DialogTitle>Join a Study</DialogTitle>
          <DialogDescription>
            To join this study, you need to first answer these questions
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex-1 flex flex-col gap-4 overflow-hidden"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex-1 flex flex-col gap-8 min-h-0 overflow-auto">
              {/* Questions (and answers) */}
              <FormField
                control={form.control}
                name="answers"
                render={({ field }) => (
                  <FormItem>
                    {answersArray.fields.map((item, index) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        // @ts-ignore
                        name={`answers[${index}].result`}
                        defaultValue={false}
                        render={(props) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel>{item.question}</FormLabel>
                            <FormControl>
                              <Switch
                                // @ts-ignore
                                checked={props.field.value}
                                onCheckedChange={props.field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                    <FormMessage />
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

function CardComponent() {
  return (
    <Card className="flex flex-col gap-4 min-w-fit h-fit pt-3 pb-5 px-5 bg-secondary shadow-md">
      <div className="flex justify-between items-center w-full h-fit ">
        <h3 className="text-lg font-medium">STUDY NAME 1: AUTHOR NAME 1</h3>
        <ChevronRightIcon className="w-7 h-7 stroke-muted-foreground" />
      </div>
      <p>
        The purpose of this study is to determine the average cock size of the
        male HomeDAO member. Only verified members of HomeDAO are allowed to
        participate in this study. The methodology for this study has been laid
        out in painstaking detail by Josh.
      </p>
      <div className="flex w-full min-w-fit h-6 gap-2">
        <Badge className="bg-orange-400">Sociology</Badge>
        <Badge className="bg-purple-500">Cocks</Badge>
        <Badge className="bg-blue-600">$0.20</Badge>

        {/* Separator */}
        <span className="flex-1" />

        <Badge className="min-w-fit" variant="destructive">
          <AlarmClockIcon className="w-4 mr-2" />6 Hours To Confirm
        </Badge>
      </div>
    </Card>
  );
}

Home.getLayout = (page) => {
  return <AppLayout>{page}</AppLayout>;
};

export default Home;
