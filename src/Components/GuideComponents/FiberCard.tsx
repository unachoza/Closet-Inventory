import "../../Features/FabricCare/TextileGuide.css";
import { Fiber, FiberCategory } from "../../Content/Fabric&Fiber";

function PropBar({ label, value, color }: { label: string; value: number; color: string }) {
	return (
		<div className="fiber-prop">
			<span className="fiber-prop-label">{label}</span>
			<div className="fiber-prop-bar">
				<div className="fiber-prop-fill" style={{ width: `${value}%`, background: color }} />
			</div>
		</div>
	);
}

function FiberTag({ category, label }: { category: FiberCategory; label: string }) {
	const cls =
		category === "animal"
			? "fiber-tag tag-animal"
			: category === "plant"
				? "fiber-tag tag-plant"
				: category === "semi"
					? "fiber-tag tag-semi"
					: "fiber-tag tag-synth";
	return <span className={cls}>{label}</span>;
}

const FiberCard = ({ fiber, onClick }: { fiber: Fiber; onClick: () => void }) => {
	return (
		<div className="fiber-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick()}>
			<img className="fiber-card-img" src={fiber.imageUrl} alt={fiber.imageAlt} loading="lazy" />
			<div className="fiber-card-body">
				<FiberTag category={fiber.category} label={fiber.tagLabel} />
				<h3>{fiber.name}</h3>
				<p className="fiber-source">{fiber.source}</p>
				<p>{fiber.description}</p>
				<div className="fiber-props">
					{fiber.properties.map((p: any) => (
						<PropBar key={p.label} label={p.label} value={p.value} color={p.color} />
					))}
				</div>
			</div>
		</div>
	);
};

export { FiberCard, FiberTag };
