import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import AppLayout from "@/layouts/app-layout";
import { LayoutPage } from "@/layouts/root-layout";
import requestInterceptorRunner from "@/request-interceptors/request-interceptor-runner";
import { AlarmClockIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { GetServerSideProps } from "next";
import NewStudy from "./new-study-form";

export const getServerSideProps: GetServerSideProps<ProposeProps> = async (
  context,
) =>
  await requestInterceptorRunner<ProposeProps>(context, [], async () => {
    // Do data fetching for home page with GraphQL

    // Return this data as server-side props
    return { props: {} };
  });

export interface ProposeProps {}

const Propose: LayoutPage = () => {
  return (
    <div className="w-full h-full px-6 py-2 overflow-clip lg:px-16">
      <ScrollArea className="w-full h-full min-h-0">
        <div className="w-full h-full px-2 py-2 flex flex-col ">
          {/* Propose new study section */}
          <section className="flex flex-col gap-3 h-fit">
            <h1 className="text-5xl leading-[64px] font-medium mt-8">
              Propose New Study
            </h1>

            {/* New Study button */}
            <NewStudy>
              <Card className="select-none cursor-pointer flex flex-col min-w-fit h-fit pt-3 pb-5 px-5 bg-secondary shadow-md">
                <div className="flex justify-end items-center w-full h-fit">
                  <ChevronRightIcon className="w-7 h-7 stroke-muted-foreground" />
                </div>
                <div className="flex justify-center items-center w-full h-fit mt-4 mb-2">
                  <PlusIcon className="w-12 h-12" />
                </div>
                <div className="w-full text-center text-muted-foreground">
                  <h3 className="text-2xl font-medium mb-1">
                    Propose a New Study
                  </h3>
                  <p className="text-lg">
                    You&apos;ve proposed 3 more studies which are currently
                    waiting for more participants.
                  </p>
                </div>
              </Card>
            </NewStudy>
          </section>

          {/* Your Studies Section */}
          <section className="flex flex-col gap-8 h-fit">
            <div>
              <h1 className="text-5xl leading-[64px] font-medium mt-8">
                Your Studies
              </h1>
            </div>

            {/* Onboarding Participants section */}
            <div>
              <h1 className="text-3xl font-medium mb-4">
                Onboarding Participants
              </h1>
              <ul className="flex flex-col gap-4">
                <CardComponent />
                <CardComponent />
                <CardComponent />
              </ul>
            </div>

            {/* Data Collection Ongoing section */}
            <div>
              <h1 className="text-3xl font-medium mb-4">
                Data Collection Ongoing
              </h1>
              <ul className="flex flex-col gap-4">
                <CardComponent />
                <CardComponent />
                <CardComponent />
              </ul>
            </div>

            {/* Completed Studies section */}
            <div>
              <h1 className="text-3xl font-medium mb-4">Completed Studies</h1>
              <ul className="flex flex-col gap-4">
                <CardComponent />
                <CardComponent />
                <CardComponent />
              </ul>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

function CardComponent() {
  return (
    <Card className="flex flex-col gap-4 min-w-fit h-fit pt-3 pb-5 px-5 bg-secondary shadow-md">
      <div className="flex justify-between items-center w-full h-fit">
        <h3 className="text-lg font-medium">STUDY NAME 1: AUTHOR NAME 1</h3>
        <ChevronRightIcon className="w-7 h-7 stroke-muted-foreground" />
      </div>
      <p>
        The purpose of this study is to determine the average nose size of the
        male HomeDAO member. Only verified members of HomeDAO are allowed to
        participate in this study. The methodology for this study has been laid
        out in painstaking detail by Josh.
      </p>
      <div className="flex w-full min-w-fit h-6 gap-2">
        <Badge className="bg-orange-400">Sociology</Badge>
        <Badge className="bg-purple-500">Noses</Badge>
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

Propose.getLayout = (page) => {
  return <AppLayout>{page}</AppLayout>;
};

export default Propose;
