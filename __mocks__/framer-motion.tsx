import React from "react";
import { vi } from "vitest";

// Replace all motion.* components with plain HTML pass-throughs.
// This prevents framer-motion from injecting <style> elements that jsdom can't parse.
const makeEl = (tag: string) =>
	React.forwardRef(
		(
			{
				children,
				animate: _animate,
				initial: _initial,
				exit: _exit,
				transition: _transition,
				variants: _variants,
				whileHover: _whileHover,
				whileTap: _whileTap,
				whileFocus: _whileFocus,
				whileInView: _whileInView,
				layout: _layout,
				layoutId: _layoutId,
				drag: _drag,
				dragConstraints: _dragConstraints,
				custom: _custom,
				...rest
			}: Record<string, unknown> & { children?: React.ReactNode },
			ref: React.Ref<HTMLElement>,
		) => React.createElement(tag, { ...rest, ref }, children),
	);

const motion = new Proxy(
	{},
	{ get: (_target, tag: string) => makeEl(tag) },
);

const AnimatePresence = ({ children }: { children?: React.ReactNode }) =>
	React.createElement(React.Fragment, null, children);

const useAnimation = () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() });
const useMotionValue = (v: unknown) => ({ get: () => v, set: vi.fn(), onChange: vi.fn() });
const useTransform = (v: unknown) => v;
const useSpring = (v: unknown) => v;
const useInView = () => true;
const useReducedMotion = () => false;

export {
	motion,
	AnimatePresence,
	useAnimation,
	useMotionValue,
	useTransform,
	useSpring,
	useInView,
	useReducedMotion,
};
