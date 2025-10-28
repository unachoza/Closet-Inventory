import "./PaginationControls.css";

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	onNext: () => void;
	onPrev: () => void;
}

const PaginationControls = ({ currentPage, totalPages, onNext, onPrev }: PaginationControlsProps) => {
	if (totalPages <= 1) return null;
	return (
		<div>
			<div className="pagination-controls">
				<button onClick={onPrev} disabled={currentPage === 1}>
					← Previous
				</button>
				<span>
					Page {currentPage} of {totalPages}
				</span>
				<button onClick={onNext} disabled={currentPage === totalPages}>
					Next →
				</button>
			</div>
		</div>
	);
};

export default PaginationControls;
