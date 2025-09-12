import * as _ from "lodash";
export * from "./validation";

const convertToObject = (data: any) => {
  return _.isString(data) ? { error: data } : data;
};

export { convertToObject };
