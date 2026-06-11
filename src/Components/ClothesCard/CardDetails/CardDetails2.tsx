import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ClothingDetail } from "./cardData";

import "./CardOptionD.css";

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="section-title">
      <span className="section-title-label">{label}</span>
      <div className="section-title-divider" />
    </div>
  );
}

interface CardDProps {
  item: ClothingDetail;
  onEdit?: () => void;
  onRemove?: () => void;
}

export function CardOptionD({
  item,
  onEdit,
  onRemove,
}: CardDProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="card-option-d">
      {/* Header */}
      <div className="card-header">
        <div className="card-header-content">
          <p className="card-title">{item.name}</p>
          <p className="card-brand">{item.brand}</p>
        </div>

        <span className="small-tag category-tag">
          {item.category}
        </span>
      </div>

      <div className="divider" />

      {/* Color + size */}
      <div className="row-between">
        <div className="row-center">
          <div className="color-dot" />

          <span className="color-text">
            {item.color}
          </span>
        </div>

        <span className="pill">
          {item.size} · {item.sizeSystem}
        </span>
      </div>

      {/* Composition */}
      <div>
        <SectionTitle label="Composition" />

        <div className="composition-percentages">
          {item.material.map((m) => (
            <span
              key={m.name}
              className={`composition-percent ${
                m.color === "#4ab6f5"
                  ? "composition-percent-blue"
                  : ""
              }`}
            >
              {m.pct}%
            </span>
          ))}
        </div>

        <div className="composition-bar">
          {item.material.map((m) => (
            <div
              key={m.name}
              style={{
                flex: m.pct,
                background: m.color,
              }}
            />
          ))}
        </div>

        <div className="composition-labels">
          {item.material.map((m) => (
            <span
              key={m.name}
              className="composition-label"
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>

      {/* Care */}
      <div>
        <SectionTitle label="Care" />

        <div className="tag-group">
          {item.care.map((c) => (
            <span
              key={c.label}
              className="small-tag"
            >
              {c.emoji} {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: 0.28,
              ease: "easeInOut",
            }}
            className="expanded-wrapper"
          >
            <div className="expanded-content">
              <div>
                <SectionTitle label="Identity" />

                <p className="detail-text">
                  {item.season} · {item.year} ·{" "}
                  {item.price}
                  <br />
                  {item.retailer} ·{" "}
                  {item.condition} ·{" "}
                  {item.howAcquired}
                </p>
              </div>

              <div>
                <SectionTitle label="Sizing" />

                <p className="detail-text">
                  {item.size} (
                  {item.sizeSystem}) ·{" "}
                  {item.fitType}
                </p>
              </div>

              <div>
                <SectionTitle label="Style" />

                <p className="detail-text">
                  {item.neckline} ·{" "}
                  {item.sleeve}
                  <br />
                  {item.silhouette} ·{" "}
                  {item.closure} ·{" "}
                  {item.texture}
                </p>
              </div>

              <div>
                <SectionTitle label="Occasion" />

                <div className="tag-group">
                  {item.occasion.map((o) => (
                    <span
                      key={o}
                      className="pill"
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>

              {item.notes && (
                <div>
                  <SectionTitle label="Notes" />

                  <p className="notes-text">
                    "{item.notes}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && (
        <div className="flex-spacer" />
      )}

      {/* Action buttons */}
      {confirming ? (
        <div className="confirm-container">
          <p className="confirm-text">
            Remove this item?
          </p>

          <div className="button-row">
            <button
              onClick={() =>
                setConfirming(false)
              }
              className="button-base button-cancel"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                setConfirming(false);
                onRemove?.();
              }}
              className="button-base button-remove-confirm"
            >
              Yes, remove
            </button>
          </div>
        </div>
      ) : (
        <div className="button-row">
          <button
            onClick={() =>
              setConfirming(true)
            }
            className="button-base button-remove"
          >
            Remove
          </button>

          <button
            onClick={onEdit}
            className="button-base button-edit"
          >
            Edit
          </button>
        </div>
      )}

      <button
        onClick={() =>
          setExpanded(!expanded)
        }
        className="button-expand"
      >
        {expanded
          ? "Show less"
          : "See all details"}
      </button>
    </div>
  );
}