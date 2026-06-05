import type { ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";

import styles from "./Dropdown.module.css";

export type DropdownItem = {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  danger?: boolean;
};

type DropdownProps = {
  trigger?: ReactNode;
  items: DropdownItem[];
  triggerLabel?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  contentClassName?: string;
};

const getClassName = (...classNames: Array<string | false | undefined>) =>
  classNames.filter(Boolean).join(" ");

export const Dropdown = ({
  trigger,
  items,
  triggerLabel = "Ações",
  align = "end",
  sideOffset = 8,
  contentClassName,
}: DropdownProps) => {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        {trigger ?? (
          <button className={styles.trigger} aria-label={triggerLabel}>
            <MoreHorizontal size={16} />
          </button>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={getClassName(styles.content, contentClassName)}
          sideOffset={sideOffset}
          align={align}
        >
          {items.map((item, index) => (
            <DropdownMenu.Item
              key={`${item.label}-${index}`}
              className={getClassName(
                styles.item,
                item.danger && styles.danger,
                item.disabled && styles.disabled,
              )}
              onSelect={item.onSelect}
              disabled={item.disabled}
            >
              {item.icon}
              <span>{item.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};


