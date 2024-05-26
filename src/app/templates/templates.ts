import { readFile } from "fs/promises";
import Mustache from "mustache";

const transformTemplate = async (
  filepath: string,
  data: { FirstName: string; OTP: string }
) => {
  var template = await readFile(filepath, "utf8");

  return Mustache.render(template, data);
};

export { transformTemplate };
