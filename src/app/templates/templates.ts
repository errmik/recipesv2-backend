import { readFile } from "fs/promises";
import Mustache from "mustache";
import path from "path";

const transformTemplate = async (
  filepath: string,
  data: { FirstName: string; OTP: string }
) => {
  //File is expected to be in the same directory

  var template = await readFile(
    path.join(import.meta.dirname, filepath),
    "utf8"
  );

  return Mustache.render(template, data);
};

export { transformTemplate };
