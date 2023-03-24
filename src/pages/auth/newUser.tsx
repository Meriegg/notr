import { verifyAuthState } from "@/server/utils/verifyAuthState";
import type {
  GetServerSidePropsContext,
  GetServerSideProps,
  NextPage,
} from "next";

const NewUser: NextPage = () => {
  return <></>;
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => await verifyAuthState(ctx);

export default NewUser;
