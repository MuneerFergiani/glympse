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
    <div className="w-full h-full overflow-clip lg:px-16">
      <ScrollArea className="w-full h-full min-h-0 px-6">
        <div className="w-full h-full my-16 gap-16 flex flex-col ">
          {/* Browse studies section */}
          <section className="flex flex-col gap-6 h-fit">
            <h1 className="text-4xl leading-tight font-semibold mb-4">
              Propose New Study
            </h1>

            {/* New Study button */}
            <NewStudy>
              <Card className="select-none cursor-pointer flex flex-col min-w-fit h-fit pt-4 pb-5 px-5 bg-secondary shadow-md">
                <div className="flex justify-end items-center w-full h-fit">
                  <ChevronRightIcon className="w-6 h-6 stroke-muted-foreground" />
                </div>
                <div className="flex justify-center items-center w-full h-fit mt-4 mb-4">
                  <PlusIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="w-full pb-6 text-center text-muted-foreground">
                  <h3 className="text-2xl font-medium mb-2">
                    Propose a New Study
                  </h3>
                  <p className="text-lg">
                    Query verified users and get reliable, validated results.
                  </p>
                </div>
              </Card>
            </NewStudy>
          </section>

          {/* Your Studies Section */}
          <section className="flex flex-col gap-0 h-fit">
            <div>
              <h1 className="text-4xl leading-tight font-semibold">
                Your Studies
              </h1>
            </div>

            {/* Onboarding Participants section */}
            <div>
              <h1 className="text-2xl font-medium mt-6 mb-6">
                Onboarding Participants
              </h1>
              <ul className="flex flex-col gap-6">
                <CardComponent />
                <CardComponent />
                <CardComponent />
              </ul>
            </div>

            {/* Data Collection Ongoing section */}
            <div>
              <h1 className="text-2xl font-medium mt-10 mb-6">
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
              <h1 className="text-2xl font-medium mt-10 mb-6">
                Completed Studies
              </h1>
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
    <Card className="flex flex-col gap-2 min-w-fit h-fit py-4 px-6 bg-secondary shadow-md">
      <div className="flex justify-between items-center w-full h-fit ">
        <h3 className="text-lg leading-tight font-medium">
          STUDY NAME 1: AUTHOR NAME 1
        </h3>
        <ChevronRightIcon className="w-6 h-6 stroke-muted-foreground" />
      </div>
      <p className="pb-2">
        The purpose of this study is to determine the average cock size of the
        male HomeDAO member. Only verified members of HomeDAO are allowed to
        participate in this study. The methodology for this study has been laid
        out in painstaking detail by Josh.
      </p>
      <div className="flex w-full min-w-fit h-6 gap-2.5">
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

Propose.getLayout = (page) => {
  return <AppLayout>{page}</AppLayout>;
};

export default Propose;
