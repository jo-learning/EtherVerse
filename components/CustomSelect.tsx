import React, { useState, useRef, useEffect } from "react";

const COLORS = {
  purple: "#4b0082",
  neonGreen: "#ffffff",
  black: "#0D0D0D",
  white: "#ffffff",
  background: "#0a1026",
  navy: "#172042",
  textWhite: "#ffffff",
  textGray: "#b0b8c1",
};

type CustomSelectProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement> | string) => void;
  options: { value: string; label: string; emoji?: string }[];
  placeholder: string;
  required?: boolean;
};

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  required,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard accessibility: ESC to close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const selected = options.find(opt => opt.value === value);

  return (
    <>
      {/* Transparent input field */}
      <div
        className="relative cursor-pointer"
        style={{
          marginBottom: "1.5rem",
          borderBottom: `2.5px solid ${COLORS.purple}40`,
          borderRadius: 0,
          background: "transparent",
        }}
        onClick={() => setOpen(true)}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") setOpen(true);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div
          className="flex items-center px-4 pt-2 pb-2 font-semibold"
          style={{
            background: "rgba(26, 32, 60, 0.25)",
            color: value ? COLORS.textWhite : COLORS.textGray,
            fontSize: "1.13rem",
            transition: "background 0.3s",
            borderRadius: "1rem 1rem 0 0",
            minHeight: 48,
            userSelect: "none",
          }}
        >
          {selected ? (
            <>
              {selected.emoji && <span style={{ marginRight: 8 }}>{selected.emoji}</span>}
              {selected.label}
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        {/* Custom dropdown arrow */}
        <span
          style={{
            position: "absolute",
            right: 22,
            top: "50%",
            transform: "translateY(-60%)",
            pointerEvents: "none",
            fontSize: 22,
            background: "linear-gradient(90deg, #4b0082 0%, #ffffff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            textShadow: "0 2px 8px #0002",
          }}
        >
          
        </span>
      </div>

      {/* Modal dropdown */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{
            background: "rgba(13,13,13,0.45)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            transition: "background 0.3s",
          }}
        >
          <div
            ref={modalRef}
            className="w-full"
            style={{
              background: COLORS.navy,
              borderTopLeftRadius: "1.5rem",
              borderTopRightRadius: "1.5rem",
              boxShadow: "0 -8px 32px 0 rgba(75,0,130,0.18)",
              padding: "2rem 0.5rem 1.5rem 0.5rem",
              maxHeight: "60vh",
              overflowY: "auto",
              animation: "slideUp 0.35s cubic-bezier(.4,1.6,.6,1)",
            }}
          >
            <div className="mb-4 flex justify-center">
              <div
                style={{
                  width: 48,
                  height: 6,
                  borderRadius: 3,
                  background: COLORS.purple,
                  opacity: 0.5,
                }}
              />
            </div>
            <ul
              tabIndex={-1}
              role="listbox"
              aria-activedescendant={value}
              style={{ padding: 0, margin: 0, listStyle: "none" }}
            >
              {options.map(opt => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  className="px-6 py-4 mb-2 rounded-xl cursor-pointer font-semibold flex items-center transition-all"
                  style={{
                    background:
                      opt.value === value
                        ? `linear-gradient(90deg, ${COLORS.purple} 0%, ${COLORS.background} 100%)`
                        : "rgba(255,255,255,0.01)",
                    color: opt.value === value ? COLORS.neonGreen : COLORS.textWhite,
                    fontSize: "1.13rem",
                    boxShadow:
                      opt.value === value
                        ? "0 2px 12px 0 rgba(75,0,130,0.12)"
                        : "none",
                    border: opt.value === value ? `2px solid ${COLORS.purple}` : "none",
                  }}
                  onClick={() => {
                    setOpen(false);
                    // For compatibility with your onChange signature
                    if (typeof onChange === "function") {
                      // Simulate a select event
                      const fakeEvent = {
                        target: { value: opt.value },
                      } as React.ChangeEvent<HTMLSelectElement>;
                      onChange(fakeEvent);
                    }
                  }}
                >
                  {opt.emoji && <span style={{ marginRight: 12, fontSize: 22 }}>{opt.emoji}</span>}
                  {opt.label}
                </li>
              ))}
            </ul>
          </div>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}