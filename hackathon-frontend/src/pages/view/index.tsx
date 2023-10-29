import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import AppLayout from "@/layouts/app-layout";
import { LayoutPage } from "@/layouts/root-layout";
import requestInterceptorRunner from "@/request-interceptors/request-interceptor-runner";
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

            <ul className="flex flex-col gap-4">
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
            </ul>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

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

View.getLayout = (page) => {
  return <AppLayout>{page}</AppLayout>;
};

export default View;
