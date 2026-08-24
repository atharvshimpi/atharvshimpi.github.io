import { useEffect, useRef, useState, useCallback } from "react";
import {
	addTrailPoint as addSharedTrailPoint,
	ageTrailPoints,
	drawLaserTrail,
	type TrailPoint,
} from "../utils/laserTrail";

// ── CONSTANTS ─────────────────────────────────────────────────
const LIVES = 3;
const LASER_COLOR = "91, 191, 191";
const TRAIL_LIFETIME_MS = 650;
const MAX_TRAIL = 60;
const MIN_DIST = 4;
const MAX_GAP = 80;
const MAX_SHAPES = 14;
const MAX_PARTICLES = 40;

type ShapeKind = "circle" | "square" | "triangle";

interface Shape {
	id: number;
	kind: ShapeKind;
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	color: string;
	rotation: number;
	rotSpeed: number;
	sliced: boolean;
}

interface SliceParticle {
	id: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	color: string;
	kind: ShapeKind;
	alpha: number;
	rotation: number;
	rotSpeed: number;
	half: "top" | "bottom";
}

const SHAPE_COLORS = [
	"#5BBFBF",
	"#8ED8D8",
	"#E08080",
	"#80C8A0",
	"#C8A080",
	"#A080C8",
];

const SHAPE_KINDS: ShapeKind[] = ["circle", "square", "triangle"];

let nextId = 1;

// ── GEOMETRY HELPERS ──────────────────────────────────────────
function segmentIntersectsCircle(
	ax: number,
	ay: number,
	bx: number,
	by: number,
	cx: number,
	cy: number,
	r: number,
): boolean {
	const dx = bx - ax,
		dy = by - ay;
	const fx = ax - cx,
		fy = ay - cy;
	const a = dx * dx + dy * dy;
	const b = 2 * (fx * dx + fy * dy);
	const c = fx * fx + fy * fy - r * r;
	let discriminant = b * b - 4 * a * c;
	if (discriminant < 0) return false;
	discriminant = Math.sqrt(discriminant);
	const t1 = (-b - discriminant) / (2 * a);
	const t2 = (-b + discriminant) / (2 * a);
	return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
}

// Approximate square & triangle as circles for hit detection (good enough)
function shapeHitRadius(shape: Shape): number {
	return shape.kind === "circle" ? shape.radius : shape.radius * 0.9;
}

// Left-click/tap now drives slicing, so ignore presses that land on HUD buttons.
function isInteractiveTarget(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest("button") !== null;
}

// ── DRAW HELPERS ──────────────────────────────────────────────
function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, alpha = 1) {
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.translate(shape.x, shape.y);
	ctx.rotate(shape.rotation);
	ctx.fillStyle = shape.color;
	ctx.strokeStyle = "rgba(255,255,255,0.25)";
	ctx.lineWidth = 1.5;
	ctx.shadowColor = shape.color;
	ctx.shadowBlur = 12;

	if (shape.kind === "circle") {
		ctx.beginPath();
		ctx.arc(0, 0, shape.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	} else if (shape.kind === "square") {
		const s = shape.radius;
		ctx.beginPath();
		ctx.roundRect(-s, -s, s * 2, s * 2, 6);
		ctx.fill();
		ctx.stroke();
	} else {
		const s = shape.radius;
		ctx.beginPath();
		ctx.moveTo(0, -s);
		ctx.lineTo(s * 0.87, s * 0.5);
		ctx.lineTo(-s * 0.87, s * 0.5);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
	ctx.restore();
}

function drawHalf(ctx: CanvasRenderingContext2D, p: SliceParticle) {
	ctx.save();
	ctx.globalAlpha = p.alpha;
	ctx.translate(p.x, p.y);
	ctx.rotate(p.rotation);
	ctx.fillStyle = p.color;
	ctx.shadowColor = p.color;
	ctx.shadowBlur = 8;

	const s = p.radius;
	ctx.beginPath();
	if (p.half === "top") {
		ctx.rect(-s, -s, s * 2, s);
	} else {
		ctx.rect(-s, 0, s * 2, s);
	}
	ctx.clip();

	if (p.kind === "circle") {
		ctx.beginPath();
		ctx.arc(0, 0, s, 0, Math.PI * 2);
		ctx.fill();
	} else if (p.kind === "square") {
		ctx.beginPath();
		ctx.roundRect(-s, -s, s * 2, s * 2, 6);
		ctx.fill();
	} else {
		ctx.beginPath();
		ctx.moveTo(0, -s);
		ctx.lineTo(s * 0.87, s * 0.5);
		ctx.lineTo(-s * 0.87, s * 0.5);
		ctx.closePath();
		ctx.fill();
	}
	ctx.restore();
}

// ── COMPONENT ─────────────────────────────────────────────────
interface LaserSlicerGameProps {
	isOpen: boolean;
	onClose: () => void;
}

type GameState = "countdown" | "playing" | "gameover";

export default function LaserSlicerGame({
	isOpen,
	onClose,
}: LaserSlicerGameProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const stateRef = useRef<{
		shapes: Shape[];
		particles: SliceParticle[];
		trail: TrailPoint[];
		score: number;
		lives: number;
		gameState: GameState;
		countdown: number;
		spawnTimer: number;
		spawnInterval: number;
		speedMult: number;
		diffTimer: number;
		isDrawing: boolean;
		lastTime: number;
		countdownIntervalId: number | null;
		animId: number;
	}>({
		shapes: [],
		particles: [],
		trail: [],
		score: 0,
		lives: LIVES,
		gameState: "countdown",
		countdown: 3,
		spawnTimer: 0,
		spawnInterval: 1800,
		speedMult: 1,
		diffTimer: 0,
		isDrawing: false,
		lastTime: 0,
		countdownIntervalId: null,
		animId: 0,
	});

	const [displayScore, setDisplayScore] = useState(0);
	const [displayLives, setDisplayLives] = useState(LIVES);
	const [displayState, setDisplayState] = useState<GameState>("countdown");
	const [displayCountdown, setDisplayCountdown] = useState(3);
	const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

	const spawnShape = useCallback((canvas: HTMLCanvasElement) => {
		const s = stateRef.current;
		const kind =
			SHAPE_KINDS[Math.floor(Math.random() * SHAPE_KINDS.length)];
		const color =
			SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)];
		const radius = 28 + Math.random() * 20;
		const edge = Math.floor(Math.random() * 4);
		let x = 0,
			y = 0,
			vx = 0,
			vy = 0;
		const speed = (2.5 + Math.random() * 1.5) * s.speedMult;
		if (edge === 0) {
			x = Math.random() * canvas.width;
			y = -radius;
			vx = (Math.random() - 0.5) * speed;
			vy = speed;
		} else if (edge === 1) {
			x = canvas.width + radius;
			y = Math.random() * canvas.height;
			vx = -speed;
			vy = (Math.random() - 0.5) * speed;
		} else if (edge === 2) {
			x = Math.random() * canvas.width;
			y = canvas.height + radius;
			vx = (Math.random() - 0.5) * speed;
			vy = -speed;
		} else {
			x = -radius;
			y = Math.random() * canvas.height;
			vx = speed;
			vy = (Math.random() - 0.5) * speed;
		}

		s.shapes.push({
			id: nextId++,
			kind,
			x,
			y,
			vx,
			vy,
			radius,
			color,
			rotation: Math.random() * Math.PI * 2,
			rotSpeed: (Math.random() - 0.5) * 0.04,
			sliced: false,
		});
	}, []);

	const addTrailPoint = useCallback((x: number, y: number) => {
		addSharedTrailPoint(stateRef.current.trail, x, y, {
			minDist: MIN_DIST,
			maxPoints: MAX_TRAIL,
		});
	}, []);

	const checkSlice = useCallback(() => {
		const s = stateRef.current;
		const trail = s.trail;
		if (trail.length < 2) return;
		// Check last few trail segments for freshness
		const recentStart = Math.max(0, trail.length - 8);
		const recent = trail.slice(recentStart);

		for (let si = s.shapes.length - 1; si >= 0; si--) {
			const shape = s.shapes[si];
			if (shape.sliced) continue;
			const r = shapeHitRadius(shape);
			let hit = false;
			for (let ti = 1; ti < recent.length; ti++) {
				if (
					segmentIntersectsCircle(
						recent[ti - 1].x,
						recent[ti - 1].y,
						recent[ti].x,
						recent[ti].y,
						shape.x,
						shape.y,
						r,
					)
				) {
					hit = true;
					break;
				}
			}
			if (!hit) continue;
			shape.sliced = true;
			s.score += 10;
			setDisplayScore(s.score);

			// Spawn two half-particles flying apart
			const spread = 2 + Math.random() * 2;
			(["top", "bottom"] as const).forEach((half) => {
				const dy = half === "top" ? -spread : spread;
				s.particles.push({
					id: nextId++,
					x: shape.x,
					y: shape.y,
					vx: shape.vx + (Math.random() - 0.5) * 2,
					vy: shape.vy + dy,
					radius: shape.radius,
					color: shape.color,
					kind: shape.kind,
					alpha: 1,
					rotation: shape.rotation,
					rotSpeed: shape.rotSpeed * 2,
					half,
				});
			});
			if (s.particles.length > MAX_PARTICLES) {
				s.particles.splice(0, s.particles.length - MAX_PARTICLES);
			}
			s.shapes.splice(si, 1);
		}
	}, []);

	// Restartable — used both on first mount and when "Play Again" is clicked.
	const startCountdown = useCallback(() => {
		const s = stateRef.current;
		if (s.countdownIntervalId !== null)
			clearInterval(s.countdownIntervalId);

		s.gameState = "countdown";
		s.countdown = 3;
		setDisplayState("countdown");
		setDisplayCountdown(3);

		s.countdownIntervalId = window.setInterval(() => {
			s.countdown -= 1;
			if (s.countdown <= 0) {
				if (s.countdownIntervalId !== null)
					clearInterval(s.countdownIntervalId);
				s.countdownIntervalId = null;
				s.gameState = "playing";
				setDisplayState("playing");
			} else {
				setDisplayCountdown(s.countdown);
			}
		}, 1000);
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const s = stateRef.current;
		// Reset state
		s.shapes = [];
		s.particles = [];
		s.trail = [];
		s.score = 0;
		s.lives = LIVES;
		s.spawnTimer = 0;
		s.spawnInterval = 1800;
		s.speedMult = 1;
		s.diffTimer = 0;
		s.isDrawing = false;
		s.lastTime = performance.now();
		setDisplayScore(0);
		setDisplayLives(LIVES);

		function resize() {
			if (!canvas) return;
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			setIsMobile(window.innerWidth <= 768);
		}
		resize();
		window.addEventListener("resize", resize);

		startCountdown();

		// ── GAME LOOP ──────────────────────────────────────────────
		function loop(now: number) {
			if (!canvas || !ctx) return;
			const dt = Math.min(now - s.lastTime, 50);
			s.lastTime = now;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			if (s.gameState === "playing") {
				// Difficulty ramp: every 15s speed up and spawn faster
				s.diffTimer += dt;
				if (s.diffTimer > 15000) {
					s.diffTimer = 0;
					s.speedMult = Math.min(s.speedMult + 0.25, 3);
					s.spawnInterval = Math.max(s.spawnInterval - 150, 700);
				}

				// Spawn shapes
				s.spawnTimer += dt;
				if (s.spawnTimer >= s.spawnInterval) {
					s.spawnTimer = 0;
					if (s.shapes.length < MAX_SHAPES) spawnShape(canvas);
				}

				// Update shapes
				for (let i = s.shapes.length - 1; i >= 0; i--) {
					const sh = s.shapes[i];
					sh.x += sh.vx;
					sh.y += sh.vy;
					sh.rotation += sh.rotSpeed;

					// Off screen — lose a life
					const margin = sh.radius + 10;
					if (
						sh.x < -margin ||
						sh.x > canvas.width + margin ||
						sh.y < -margin ||
						sh.y > canvas.height + margin
					) {
						s.shapes.splice(i, 1);
						s.lives -= 1;
						setDisplayLives(s.lives);
						if (s.lives <= 0) {
							s.gameState = "gameover";
							setDisplayState("gameover");
						}
					}
				}

				// Update particles
				for (let i = s.particles.length - 1; i >= 0; i--) {
					const p = s.particles[i];
					p.x += p.vx;
					p.y += p.vy;
					p.vy += 0.12; // gravity
					p.alpha -= dt / 600;
					p.rotation += p.rotSpeed;
					if (p.alpha <= 0) s.particles.splice(i, 1);
				}

				// Age trail
				ageTrailPoints(s.trail, dt, TRAIL_LIFETIME_MS);

				// Draw shapes
				s.shapes.forEach((sh) => drawShape(ctx, sh));

				// Draw particles
				s.particles.forEach((p) => drawHalf(ctx, p));

				// Draw trail
				drawLaserTrail(ctx, s.trail, {
					color: LASER_COLOR,
					lifetimeMs: TRAIL_LIFETIME_MS,
					maxGap: MAX_GAP,
					segments: 4,
					strokeAlpha: 0.4,
					strokeShadowAlpha: 0.7,
					lineWidthScale: 3,
					shadowBlurScale: 10,
					headDotBlur: 18,
				});

				// Check slices
				if (s.isDrawing) checkSlice();
			}

			s.animId = requestAnimationFrame(loop);
		}
		s.animId = requestAnimationFrame(loop);

		// ── INPUT: MOUSE ──────────────────────────────────────────
		function onContextMenu(e: MouseEvent) {
			e.preventDefault();
		}

		function onMouseDown(e: MouseEvent) {
			if (
				e.button !== 0 ||
				s.gameState !== "playing" ||
				isInteractiveTarget(e.target)
			)
				return;
			s.isDrawing = true;
			s.trail = [];
			addTrailPoint(e.clientX, e.clientY);
		}
		function onMouseMove(e: MouseEvent) {
			if (!s.isDrawing || s.gameState !== "playing") return;
			addTrailPoint(e.clientX, e.clientY);
		}
		function onMouseUp(e: MouseEvent) {
			if (e.button !== 0) return;
			s.isDrawing = false;
		}

		// ── INPUT: TOUCH ──────────────────────────────────────────
		// Single tap immediately starts the slice trail (no long-press delay).
		function onTouchStart(e: TouchEvent) {
			if (
				e.touches.length !== 1 ||
				s.gameState !== "playing" ||
				isInteractiveTarget(e.target)
			)
				return;
			const t = e.touches[0];
			s.isDrawing = true;
			s.trail = [];
			addTrailPoint(t.clientX, t.clientY);
		}
		function onTouchMove(e: TouchEvent) {
			if (!s.isDrawing || e.touches.length !== 1) return;
			e.preventDefault();
			addTrailPoint(e.touches[0].clientX, e.touches[0].clientY);
		}
		function onTouchEnd() {
			s.isDrawing = false;
		}

		window.addEventListener("contextmenu", onContextMenu);
		window.addEventListener("mousedown", onMouseDown);
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
		window.addEventListener("touchstart", onTouchStart, { passive: true });
		window.addEventListener("touchmove", onTouchMove, { passive: false });
		window.addEventListener("touchend", onTouchEnd);
		window.addEventListener("touchcancel", onTouchEnd);

		return () => {
			if (s.countdownIntervalId !== null)
				clearInterval(s.countdownIntervalId);
			cancelAnimationFrame(s.animId);
			window.removeEventListener("resize", resize);
			window.removeEventListener("contextmenu", onContextMenu);
			window.removeEventListener("mousedown", onMouseDown);
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
			window.removeEventListener("touchstart", onTouchStart);
			window.removeEventListener("touchmove", onTouchMove);
			window.removeEventListener("touchend", onTouchEnd);
			window.removeEventListener("touchcancel", onTouchEnd);
		};
	}, [isOpen, addTrailPoint, checkSlice, spawnShape, startCountdown]);

	if (!isOpen) return null;

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 8000,
				background: "rgba(7,21,32,0.97)",
				userSelect: "none",
			}}
		>
			<canvas
				ref={canvasRef}
				style={{ position: "absolute", inset: 0 }}
			/>

			{/* HUD */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "1.2rem 2rem",
					background: "rgba(7,21,32,0.6)",
					backdropFilter: "blur(8px)",
					borderBottom: "1px solid rgba(91,191,191,0.15)",
					zIndex: 1,
				}}
			>
				<div
					style={{
						fontFamily: "Cormorant Garamond, serif",
						fontSize: "1.4rem",
						color: "#5BBFBF",
					}}
				>
					{displayScore}{" "}
					<span
						style={{
							fontSize: ".7rem",
							letterSpacing: ".15em",
							color: "#7AABB8",
							textTransform: "uppercase",
						}}
					>
						pts
					</span>
				</div>
				<div
					style={{
						display: "flex",
						gap: ".5rem",
						alignItems: "center",
					}}
				>
					{Array.from({ length: LIVES }).map((_, i) => (
						<span
							key={i}
							style={{
								fontSize: "1.2rem",
								opacity: i < displayLives ? 1 : 0.2,
							}}
						>
							❤️
						</span>
					))}
				</div>
				<button
					onClick={onClose}
					style={{
						background: "none",
						border: "1px solid rgba(91,191,191,0.3)",
						color: "#7AABB8",
						cursor: "pointer",
						fontFamily: "DM Sans, sans-serif",
						fontSize: ".65rem",
						letterSpacing: ".12em",
						textTransform: "uppercase",
						padding: ".4rem .9rem",
						transition: "all .2s",
					}}
				>
					Exit
				</button>
			</div>

			{/* COUNTDOWN */}
			{displayState === "countdown" && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 2,
						pointerEvents: "none",
					}}
				>
					<div
						style={{
							fontFamily: "Cormorant Garamond, serif",
							fontSize: "8rem",
							fontWeight: 300,
							color: "#5BBFBF",
							lineHeight: 1,
							textShadow: "0 0 40px rgba(91,191,191,0.6)",
						}}
					>
						{displayCountdown}
					</div>
					<div
						style={{
							fontFamily: "DM Sans, sans-serif",
							fontSize: ".75rem",
							letterSpacing: ".2em",
							textTransform: "uppercase",
							color: "#7AABB8",
							marginTop: "1rem",
						}}
					>
						{isMobile
							? "Tap + drag to slice"
							: "Click + drag to slice"}
					</div>
				</div>
			)}

			{/* GAME OVER */}
			{displayState === "gameover" && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 2,
						background: "rgba(7,21,32,0.85)",
					}}
				>
					<div
						style={{
							fontFamily: "Cormorant Garamond, serif",
							fontSize: "3.5rem",
							fontWeight: 300,
							color: "#E8F4F8",
							marginBottom: ".5rem",
						}}
					>
						Game Over
					</div>
					<div
						style={{
							fontFamily: "Cormorant Garamond, serif",
							fontSize: "2rem",
							color: "#5BBFBF",
							marginBottom: ".5rem",
						}}
					>
						{displayScore} pts
					</div>
					<div
						style={{
							fontFamily: "DM Sans, sans-serif",
							fontSize: ".8rem",
							color: "#7AABB8",
							letterSpacing: ".08em",
							marginBottom: "2rem",
						}}
					>
						{displayScore >= 100
							? "Not bad, engineer. 🔥"
							: displayScore >= 50
								? "Getting warmer... ⚡"
								: "Back to debugging, I guess. 🐛"}
					</div>
					<div style={{ display: "flex", gap: "1rem" }}>
						<button
							onClick={() => {
								const s = stateRef.current;
								s.shapes = [];
								s.particles = [];
								s.trail = [];
								s.score = 0;
								s.lives = LIVES;
								s.spawnTimer = 0;
								s.spawnInterval = 1800;
								s.speedMult = 1;
								s.diffTimer = 0;
								s.isDrawing = false;
								setDisplayScore(0);
								setDisplayLives(LIVES);
								startCountdown();
							}}
							style={{
								background: "#5BBFBF",
								color: "#071520",
								border: "none",
								cursor: "pointer",
								fontFamily: "DM Sans, sans-serif",
								fontWeight: 500,
								fontSize: ".7rem",
								letterSpacing: ".12em",
								textTransform: "uppercase",
								padding: ".8rem 2rem",
								transition: "all .2s",
							}}
						>
							Play Again
						</button>
						<button
							onClick={onClose}
							style={{
								background: "none",
								border: "1px solid rgba(91,191,191,0.4)",
								color: "#5BBFBF",
								cursor: "pointer",
								fontFamily: "DM Sans, sans-serif",
								fontSize: ".7rem",
								letterSpacing: ".12em",
								textTransform: "uppercase",
								padding: ".8rem 2rem",
								transition: "all .2s",
							}}
						>
							Exit
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
