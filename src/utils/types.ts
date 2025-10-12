import { SetStateAction } from "react";

export type ClothingItem = {
	id: string | number;
	type: string;
	color: string;
	size: string;
	brand: string;
	material: string;
	occasion: string;
	age: string;
	care: string;
};

export interface ItemFormData {
	type: string;
	color: string; // single color
	size: string; // single size
	brand: string;
	material: string;
	occasion: string;
	age: string;
	care: string;
}

export interface Option {
	value: string;
	label: string;
}

export interface InputProps {
      id?: string;
      label?: string;
      min?: number;
      name: string;
      type?: string;
      className?: string;
      value: string | number;
      errorMessage?: string;
      placeholder: string;
      handleChange: SetStateAction<string | any>;
}