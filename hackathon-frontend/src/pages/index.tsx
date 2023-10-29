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

function JoinStudyForm({
  study,
}: {
  study: {
    id: number;
    studyName: string;
    studyDescription: string;
    studyHypothesis: string;
    dataAnalysisMethod: string;
    questions: string[];
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Card button */}
      <DialogTrigger asChild>
        <Card className="flex flex-col gap-4 min-w-fit h-fit pt-3 pb-5 px-5 bg-secondary shadow-md">
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
              Hours To Confirm
            </Badge>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100%-32px)] sm:max-w-[calc(100%-128px)] flex flex-col">
        <DialogHeader>
          <DialogTitle>Join a Study</DialogTitle>
          <DialogDescription>
            To join this study, you need to first fill out a few things
          </DialogDescription>
        </DialogHeader>
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
