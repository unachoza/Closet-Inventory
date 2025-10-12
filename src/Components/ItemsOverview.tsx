import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ClothingItem } from "../App";
import { Button } from "@/components/ui/button";

interface ItemsOverviewProps {
	clothingItems: ClothingItem[];
	onBack: () => void;
}

function ItemsOverview({ clothingItems, onBack }: ItemsOverviewProps) {
	return (
		<div className="w-full max-w-5xl flex flex-col items-center">
			<motion.div
				className="w-full max-w-3xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				{clothingItems.map((item) => (
					<Card key={item.id} className="bg-black/30 text-white">
						<CardContent>
							<p>Type: {item.type}</p>
							<p>Color: {item.color}</p>
							<p>Size: {item.size}</p>
							<p>Brand: {item.brand}</p>
							<p>Material: {item.material}</p>
							<p>Occasion: {item.occasion}</p>
							<p>Age: {item.age}</p>
							<p>Care Instructions: {item.care}</p>
						</CardContent>
					</Card>
				))}
			</motion.div>
			<Button className="mt-4" onClick={onBack}>
				Back to Carousel
			</Button>
		</div>
	);
}
export default ItemsOverview;
