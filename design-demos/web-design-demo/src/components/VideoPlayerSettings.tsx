import { Check, ChevronRight, Settings2 } from "lucide-react";

import { styled } from "../stitches.config";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuIconTrigger,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuTrigger,
  DropdownMenuTriggerItem,
} from "./DropdownMenu";

const IconTrigger = styled(DropdownMenuIconTrigger, {
  background: "transparent",
  color: "#fff",

  "&:hover": {
    background: "transparent",
  },
});

const RightSlot = styled("div", {
  marginLeft: "auto",
  paddingLeft: 20,
  color: "$grayTextSecondary",
  "[data-disabled] &": { color: "$gray8" },
});

export const VideoPlayerSettings = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconTrigger>
          <Settings2 size={16} />
        </IconTrigger>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" sideOffset={30}>
        <DropdownMenu>
          <DropdownMenuTriggerItem>
            Playback Speed
            <RightSlot>
              <ChevronRight size={14} />
            </RightSlot>
          </DropdownMenuTriggerItem>

          <DropdownMenuContent sideOffset={6}>
            <DropdownMenuItem>0.25</DropdownMenuItem>
            <DropdownMenuItem>0.5</DropdownMenuItem>
            <DropdownMenuItem>0.75</DropdownMenuItem>
            <DropdownMenuCheckboxItem checked={true}>
              <DropdownMenuItemIndicator>
                <Check size={14} />
              </DropdownMenuItemIndicator>
              Normal
            </DropdownMenuCheckboxItem>
            <DropdownMenuItem>1.25</DropdownMenuItem>
            <DropdownMenuItem>1.5</DropdownMenuItem>
            <DropdownMenuItem>1.75</DropdownMenuItem>
            <DropdownMenuItem>2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTriggerItem>
            Quality
            <RightSlot>
              <ChevronRight size={14} />
            </RightSlot>
          </DropdownMenuTriggerItem>

          <DropdownMenuContent sideOffset={6} alignOffset={-5}>
            <DropdownMenuItem>2160p</DropdownMenuItem>
            <DropdownMenuCheckboxItem checked={true}>
              <DropdownMenuItemIndicator>
                <Check size={14} />
              </DropdownMenuItemIndicator>
              1080p
            </DropdownMenuCheckboxItem>
            <DropdownMenuItem>720p</DropdownMenuItem>
            <DropdownMenuItem>540p</DropdownMenuItem>
            <DropdownMenuItem>480p</DropdownMenuItem>
            <DropdownMenuItem>360p</DropdownMenuItem>
            <DropdownMenuItem>240p</DropdownMenuItem>
            <DropdownMenuItem>144p</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
