import { MagnifyingGlassIcon, TrashIcon } from "@radix-ui/react-icons";
import { TextField, IconButton } from "@radix-ui/themes";

export default function SearchInput({
  searchInput,
  setSearchInput,
  placeholder,
}: {
  searchInput: string;
  setSearchInput: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextField.Root
      size={"3"}
      placeholder={placeholder}
      value={searchInput}
      onChange={(e) => setSearchInput(e.currentTarget.value)}
      variant="surface"
    >
      <TextField.Slot side="left">
        <MagnifyingGlassIcon height="18" width="18" />
      </TextField.Slot>
      {searchInput && (
        <TextField.Slot side="right" pr={"1"}>
          <IconButton
            variant="soft"
            className="cursor-pointer"
            onClick={() => setSearchInput("")}
          >
            <TrashIcon height="18" width="18" />
          </IconButton>
        </TextField.Slot>
      )}
    </TextField.Root>
  );
}
