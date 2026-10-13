import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import type { Material } from "../domain/practice/materials";

type Props = {
  materials: Material[];
  value: string;
  onChange: (filename: string) => void;
};

export default function MaterialSetting({ materials, value, onChange }: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndex = materials.findIndex(
    (material) => material.filename === value,
  );

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  useEffect(() => {
    if (open)
      document
        .getElementById(`${id}-option-${activeIndex}`)
        ?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex, id]);

  function choose(index: number) {
    const material = materials[index];
    if (!material) return;
    onChange(material.filename);
    setOpen(false);
    trigger.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!materials.length) return;
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(activeIndex);
      else {
        setActiveIndex(Math.max(selectedIndex, 0));
        setOpen(true);
      }
      return;
    }

    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const index = open ? activeIndex : Math.max(selectedIndex, 0);
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? materials.length - 1
            : !open
              ? index
              : (index +
                  (event.key === "ArrowDown" ? 1 : -1) +
                  materials.length) %
                materials.length;
      setActiveIndex(next);
      setOpen(true);
      return;
    }

    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const start = open ? activeIndex : selectedIndex;
      for (let offset = 1; offset <= materials.length; offset++) {
        const index = (start + offset + materials.length) % materials.length;
        if (
          materials[index].name
            .toLocaleLowerCase()
            .startsWith(event.key.toLocaleLowerCase())
        ) {
          event.preventDefault();
          setActiveIndex(index);
          setOpen(true);
          break;
        }
      }
    }
  }

  return (
    <div className="material-setting" ref={root}>
      <span id={`${id}-label`} className="material-label">
        教材
      </span>
      <div className="material-select">
        <button
          ref={trigger}
          type="button"
          role="combobox"
          aria-labelledby={`${id}-label`}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={`${id}-list`}
          aria-activedescendant={
            open ? `${id}-option-${activeIndex}` : undefined
          }
          disabled={!materials.length}
          onKeyDown={handleKeyDown}
          onBlur={() => setOpen(false)}
          onClick={() => {
            setActiveIndex(Math.max(selectedIndex, 0));
            setOpen(!open);
          }}
        >
          {materials[selectedIndex]?.name ?? "教材がありません"}
          <span className="material-arrow" aria-hidden="true" />
        </button>
        {open && (
          <div
            id={`${id}-list`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="material-options"
          >
            {materials.map((material, index) => (
              <button
                type="button"
                tabIndex={-1}
                id={`${id}-option-${index}`}
                key={material.filename}
                role="option"
                aria-selected={material.filename === value}
                className={
                  index === activeIndex
                    ? "material-option active"
                    : "material-option"
                }
                onPointerMove={() => setActiveIndex(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
              >
                <span aria-hidden="true" className="material-check">
                  {material.filename === value ? "✓" : ""}
                </span>
                {material.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
