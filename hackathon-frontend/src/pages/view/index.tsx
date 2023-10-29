import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import AppLayout from "@/layouts/app-layout";
import { LayoutPage } from "@/layouts/root-layout";
import requestInterceptorRunner from "@/request-interceptors/request-interceptor-runner";
import { useStudyStore } from "@/store/study";
import { AlarmClockIcon, ChevronRightIcon } from "lucide-react";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps<ViewProps> = async (
  context,
) =>
  await requestInterceptorRunner<ViewProps>(context, [], async () => {
    // Do data fetching for home page with GraphQL

    // Return this data as server-side props
    return { props: {} };
  });

export interface ViewProps {}

const View: LayoutPage = () => {
  const studyStore = useStudyStore();

  return (
    <div className="w-full h-full px-6 py-2 overflow-clip lg:px-16">
      <ScrollArea className="w-full h-full min-h-0">
        <div className="w-full h-full px-2 py-2 flex flex-col ">
          {/* Browse studies section */}
          <section className="flex flex-col gap-8 h-fit">
            <div>
              <h1 className="text-5xl leading-[64px] font-medium mt-8">
                Browse Studies
              </h1>
              <p className=" text-lg">
                You can browse the results of studies which have already been
                completed and submitted. The results are free of fraud, do not
                feature p-hacking, were conducted anonymously and are free of
                unwanted influence.
              </p>
            </div>

            {studyStore.study.state === "completed" ? (
              <CardComponent study={studyStore.study.study} />
            ) : (
              <div className="text-4xl text-center text-muted-foreground">
                There are no studies you can currently confirm...
              </div>
            )}
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

function CardComponent({
  study,
}: {
  study: {
    studyName: string;
    studyDescription: string;
    studyHypothesis: string;
    dataAnalysisMethod: string;
    surveyQuestions: {
      question: string;
    }[];
    minimumParticipants: number;
    maximumParticipants: number;
    tags: { tag: string }[];
  };
}) {
  return (
    <Card className="cursor-pointer flex flex-col gap-4 min-w-fit h-fit pt-3 pb-5 px-5 bg-secondary shadow-md">
      <div className="flex justify-between items-center w-full h-fit ">
        <h3 className="text-lg font-medium">{study.studyName}</h3>
        <ChevronRightIcon className="w-7 h-7 stroke-muted-foreground" />
      </div>
      <p>{study.studyDescription}</p>
      <div className="flex w-full min-w-fit h-6 gap-2">
        {study.tags?.[0] ? (
          <Badge className="bg-orange-400 hover:bg-orange-400">
            {study.tags[0].tag}
          </Badge>
        ) : null}
        {study.tags?.[1] ? (
          <Badge className="bg-purple-500 hover:bg-purple-500">
            {study.tags[1].tag}
          </Badge>
        ) : null}
        {study.tags?.[2] ? (
          <Badge className="g-blue-600 hover:bg-blue-600">
            {study.tags[2].tag}
          </Badge>
        ) : null}

        {/* Separator */}
        <span className="flex-1" />
      </div>
    </Card>
  );
}

View.getLayout = (page) => {
  return <AppLayout>{page}</AppLayout>;
};

export default View;
