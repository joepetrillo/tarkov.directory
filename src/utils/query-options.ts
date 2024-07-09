import { TARKOV_API_URL } from "@/constants";
import { getAllGunsQuery, initialGunInfoQuery } from "@/graphql/queries";
import { mapAllGunsToCategories } from "@/utils/data-mapping";
import { queryOptions } from "@tanstack/react-query";
import request from "graphql-request";

const getAllGunsRequest = async () => {
  const data = await request(TARKOV_API_URL, getAllGunsQuery);
  return mapAllGunsToCategories(data);
};

export const getAllGuns = queryOptions({
  queryKey: ["allGuns"],
  queryFn: getAllGunsRequest,
});

const getGunInfo = () => request(TARKOV_API_URL, initialGunInfoQuery);

export const gunInfoQuery = queryOptions({
  queryKey: ["gunInfo"],
  queryFn: getGunInfo,
});
