import { TARKOV_API_URL } from "@/constants";
import { getAllGunsQuery, initialGunInfoQuery } from "@/graphql/queries";
import { queryOptions } from "@tanstack/react-query";
import request from "graphql-request";

const getAllGunsRequest = () => request(TARKOV_API_URL, getAllGunsQuery);

export const getAllGuns = queryOptions({
  queryKey: ["allGuns"],
  queryFn: getAllGunsRequest,
});

const getGunInfo = () => request(TARKOV_API_URL, initialGunInfoQuery);

export const gunInfoQuery = queryOptions({
  queryKey: ["gunInfo"],
  queryFn: getGunInfo,
});
