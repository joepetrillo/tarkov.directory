import Image from "next/image";
import spinner from "./eft-spinner.png";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src={spinner}
        alt="loading spinner"
        className="animate-spin"
        priority={true}
      />
    </div>
  );
}
