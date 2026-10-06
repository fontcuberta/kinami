import Review from "../page";
export default async function Family(props: {
  searchParams: Promise<{ view?: string }>;
}) {
  return Review({
    searchParams: Promise.resolve({
      ...(await props.searchParams),
      screen: "detail",
      family: "1",
    }),
  });
}
