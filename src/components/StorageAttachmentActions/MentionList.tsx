import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  Ref,
} from "react";

interface MentionListProps {
  items: string[];
  command: (item: { id: string }) => void;
}

interface MentionListRef {
  onKeyDown: (event: { key: string }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const selectItem = (index: number) => {
      const item = props.items[index];

      if (item) {
        props.command({ id: item });
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => {
      setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ key }: { key: string }) => {
        if (key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (key === "ArrowDown") {
          downHandler();
          return true;
        }

        if (key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    return (
      <div className="dropdown-menu">
        {props.items.length ? (
          props.items.map((item, index) => (
            <button
              className={index === selectedIndex ? "is-selected" : ""}
              key={index}
              onClick={() => selectItem(index)}
            >
              {item}
            </button>
          ))
        ) : (
          <div className="item">No result</div>
        )}
      </div>
    );
  }
);

export default MentionList;
