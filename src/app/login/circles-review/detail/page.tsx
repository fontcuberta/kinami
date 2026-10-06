import Review from "../page";
export default async function Detail(props: {
  searchParams: Promise<{ view?: string; empty?: string }>;
}) {
  return Review({
    searchParams: Promise.resolve({
      ...(await props.searchParams),
      screen: "detail",
    }),
  });
}
