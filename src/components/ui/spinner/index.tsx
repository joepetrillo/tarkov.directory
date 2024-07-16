import Image from "next/image";
import spinner from "./eft-spinner.png";
import { Flex } from "@radix-ui/themes";

export default function Spinner() {
  return (
    <Flex align={"center"} justify={"center"}>
      <Image
        src={spinner}
        alt="loading spinner"
        className="animate-spin"
        priority={true}
      />
    </Flex>
  );
}
