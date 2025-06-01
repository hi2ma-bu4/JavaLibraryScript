class NodeDict {
	/** @type {Map<string, Node>} */
	static _map = new Map();

	/**
	 * @param {string} key
	 * @returns {Node}
	 */
	static get(key) {
		if (!this._map.has(key)) {
			if (!isNaN(Number(key))) {
				this._map.set(key, new Node({ disp: key, type: "num" }));
			} else {
				console.warn("not found", key);
				return new Node();
			}
		}

		return this._map.get(key);
	}
	/**
	 * @param {string} key
	 * @param {{label: string, key: string, disp: string, argLength: number, args: string[], type: string}} item
	 */
	static set(key, item = {}) {
		this._map.set(key, new Node(item));
	}
}

class Node {
	/**
	 * @param {{label: string, key: string, disp: string, argLength: number, args: string[], type: string}} item
	 */
	constructor(item = {}) {
		/** @type {string} */
		this.label = item.label;
		/** @type {string} */
		this.key = item.key ?? item.label;
		/** @type {string} */
		this.disp = item.disp ?? "<empty>";
		/** @type {number} */
		this.argLength = item.argLength ?? 0;
		/** @type {string} */
		this.type = item.type;

		/** @type {Node | null} */
		this.parent = null;

		/** @type {Array<Array<Node>>} */
		this.children = Array(this.argLength).fill(null);
		for (let i = 0; i < this.argLength; i++) {
			this.children[i] = [];
		}

		if (item.args) {
			for (let i = 0; i < item.args.length; i++) {
				let a = item.args[i];
				if (!Array.isArray(a)) a = [a];
				for (let j = 0; j < a.length; j++) {
					let b = a[j];
					if (b === null) continue;

					let c;
					if (b instanceof Node) {
						c = b;
					} else {
						c = NodeDict.get(b).clone();
					}
					this.children[i].push(c);
				}
			}
		}
	}

	clone() {
		const args = this.children.map((c) => c.map((n) => n.clone()));
		return new Node({
			label: this.label,
			key: this.key,
			disp: this.disp,
			argLength: this.argLength,
			args: args,
			type: this.type,
		});
	}
}

/**
 * @param {{label: string, key: string, disp: string, argLength: number, args: string[], type: string}} item
 * @returns {Node}
 */
function node(item) {
	if (NodeDict._map.has(item.key ?? item.label)) return NodeDict._map.get(item.key ?? item.label).clone();
	const n = new Node(item);
	NodeDict.set(item.key, n);
	return n;
}

const nodeDataDict = {
	0: node({ label: "０", key: "0", disp: "0", type: "num" }),
	1: node({ label: "１", key: "1", disp: "1", type: "num" }),
	2: node({ label: "２", key: "2", disp: "2", type: "num" }),
	3: node({ label: "３", key: "3", disp: "3", type: "num" }),
	4: node({ label: "４", key: "4", disp: "4", type: "num" }),
	5: node({ label: "５", key: "5", disp: "5", type: "num" }),
	6: node({ label: "６", key: "6", disp: "6", type: "num" }),
	7: node({ label: "７", key: "7", disp: "7", type: "num" }),
	8: node({ label: "８", key: "8", disp: "8", type: "num" }),
	9: node({ label: "９", key: "9", disp: "9", type: "num" }),
	".": node({ label: ".", key: ".", disp: ".", type: "dot" }),
	"+": node({ label: "＋", key: "+", disp: "＋", type: "op" }),
	"-": node({ label: "－", key: "-", disp: "－", type: "op" }),
	"*": node({ label: "×", key: "*", disp: "×", type: "op" }),
	"/": node({ label: "÷", key: "/", disp: "÷", type: "op" }),
	"(": node({ label: "()", key: "(", disp: "", argLength: 1, type: "bracket" }),
	mod: node({ label: "mod", key: "%", disp: "%", type: "op" }),
	pi: node({ label: "π", key: "P", disp: "π", type: "static" }),
	tau: node({ label: "τ", key: "T", disp: "τ", type: "static" }),
	e: node({ label: "e", key: "E", disp: "e", type: "static" }),
	rand: node({ label: "Rnd", key: "R", disp: "rand", argLength: 0, type: "struct-func" }),
	pow: node({ label: "xⁿ", key: "^", disp: "pow", argLength: 2, type: "func" }),
	pow2: node({ label: "x²", disp: "pow", args: [null, "2"], argLength: 2, type: "struct-func" }),
	pow10: node({ label: "10ⁿ", disp: "pow", args: [["1", "0"]], argLength: 2, type: "struct-func" }),
	sqrt: node({ label: "²√x", disp: "sqrt", argLength: 1, type: "func" }),
	nthRoot: node({ label: "ⁿ√x", disp: "nthRoot", argLength: 2, type: "func" }),
	abs: node({ label: "|x|", disp: "abs", argLength: 1, type: "func" }),
	reciprocal: node({ label: "1/x", disp: "reciprocal", argLength: 1, type: "func" }),
	exp: node({ label: "eˣ", disp: "exp", argLength: 1, type: "func" }),
	exp2: node({ label: "2ˣ", disp: "exp2", argLength: 1, type: "func" }),
	expm1: node({ label: "eˣ⁻¹", disp: "expm1", argLength: 1, type: "func" }),
	"!": node({ label: "n!", key: "!", disp: "factorial", argLength: 1, type: "func" }),
	log: node({ label: "log", disp: "log", argLength: 2, type: "func" }),
	log2: node({ label: "log₂", disp: "log2", argLength: 1, type: "func" }),
	log10: node({ label: "log₁₀", disp: "log10", argLength: 1, type: "func" }),
	ln: node({ label: "ln", disp: "ln", argLength: 1, type: "func" }),
	sin: node({ label: "sin", disp: "sin", argLength: 1, type: "func" }),
	cos: node({ label: "cos", disp: "cos", argLength: 1, type: "func" }),
	tan: node({ label: "tan", disp: "tan", argLength: 1, type: "func" }),
	asin: node({ label: "asin", disp: "asin", argLength: 1, type: "func" }),
	acos: node({ label: "acos", disp: "acos", argLength: 1, type: "func" }),
	atan: node({ label: "atan", disp: "atan", argLength: 1, type: "func" }),
	atan2: node({ label: "atan2", disp: "atan2", argLength: 2, type: "func" }),
	gamma: node({ label: "Γx", disp: "gamma", argLength: 1, type: "func" }),
};

class Cursor {
	/**
	 * @param {Node | null} parent
	 * @param {number} index
	 */
	constructor(parent = null, argSlotIndex = 0, index = 0) {
		/** @type {Node | null} */
		this.parent = parent;
		/** @type {number} */
		this.argSlotIndex = argSlotIndex;
		/** @type {number} */
		this.index = index; // parent.args の何番目にいるか
	}
	/**
	 * Node を挿入
	 * @param {Node} node
	 */
	insertAtCursor(node) {
		if (!this.parent) throw new Error("親ノードがありません");

		const slot = this.parent.children[this.argSlotIndex];
		slot.splice(this.index, 0, node);
		node.parent = this.parent;

		// 関数系なら子スロットのどこかにカーソル潜り込ませたい
		if ((node.type === "func" || node.type === "struct-func") && node.children?.length > 0) {
			for (let i = 0; i < node.children.length; i++) {
				const childSlot = node.children[i];
				if (childSlot.length === 0) {
					this.parent = node;
					this.argSlotIndex = i;
					this.index = 0;
					return;
				}
			}
			// 全スロット埋まってるならノードの「後ろ」にカーソル
			// 挿入された位置 + 1 に移動
		} else {
			// 通常ノード
		}
		this.index++;
	}
	/**
	 * カーソルを左に移動する
	 * @return {boolean}
	 */
	moveLeft() {
		return this._move(-1);
	}
	/**
	 * カーソルを右に移動する
	 * @return {boolean}
	 */
	moveRight() {
		return this._move(+1);
	}
	/**
	 * 左を削除する
	 * @return {boolean}
	 */
	deleteLeft() {
		if (!this.parent) return false;

		const slot = this.parent.children[this.argSlotIndex];

		if (this.index > 0) {
			// 1. スロット内: 単純削除
			slot.splice(this.index - 1, 1);
			this.index--;
			return true;
		} else {
			// 2. 他のスロットにカーソルを戻す
			let prevSlotIndex = this.argSlotIndex - 1;
			while (prevSlotIndex >= 0) {
				const prevSlot = this.parent.children[prevSlotIndex];
				if (prevSlot.length > 0) {
					this.argSlotIndex = prevSlotIndex;
					this.index = prevSlot.length;
					return true;
				}
				prevSlotIndex--;
			}

			// 3. 親スロットの中でこのノード自身の前に戻れるか
			if (this.parent.parent) {
				const grand = this.parent.parent;
				for (let i = 0; i < grand.children.length; i++) {
					const slot = grand.children[i];
					const idx = slot.indexOf(this.parent);
					if (idx > 0) {
						this.parent = grand;
						this.argSlotIndex = i;
						this.index = idx;
						return true;
					}
				}
			}
		}

		// 4. 何もできない場合
		return false;
	}
	/**
	 * カーソルを移動する
	 * @param {number} direction -1: 左へ移動 1: 右へ移動
	 * @return {boolean}
	 */
	_move(direction) {
		if (!this.parent) return false;

		const curSlot = this.parent.children[this.argSlotIndex];

		// スロット内で移動できる場合
		if (0 <= this.index + direction && this.index + direction <= curSlot.length) {
			if (direction === 1 && this.index < curSlot.length) {
				const nextNode = curSlot[this.index];
				if (nextNode.children?.length > 0) {
					this.parent = nextNode;
					this.argSlotIndex = 0;
					this.index = 0;
					return true;
				}
			}
			if (direction === -1 && this.index > 0) {
				const prevNode = curSlot[this.index - 1];
				if (prevNode.children?.length > 0) {
					const last = prevNode.children.length - 1;
					this.parent = prevNode;
					this.argSlotIndex = last;
					this.index = prevNode.children[last].length;
					return true;
				}
			}

			this.index += direction;
			return true;
		}

		// 次スロット（前または後）を探す
		let nextSlotIndex = this.argSlotIndex + direction;
		while (0 <= nextSlotIndex && nextSlotIndex < this.parent.children.length) {
			const slot = this.parent.children[nextSlotIndex];
			if (slot || direction === -1) {
				this.argSlotIndex = nextSlotIndex;
				this.index = direction === -1 ? slot.length : 0;
				return true;
			}
			nextSlotIndex += direction;
		}

		// 親をたどっていく：再帰的処理
		if (this.parent.parent) {
			const grand = this.parent.parent;
			const slots = grand.children;
			const parentSlotIndex = slots.findIndex((s) => s.includes(this.parent));
			const parentIndex = slots[parentSlotIndex].indexOf(this.parent);

			const newIndex = parentIndex + (direction === -1 ? 0 : 1);
			if (0 <= newIndex && newIndex <= slots[parentSlotIndex].length) {
				this.parent = grand;
				this.argSlotIndex = parentSlotIndex;
				this.index = newIndex;
				return true;
			}
		}

		// 最後までたどってもダメなら false
		return false;
	}
}

class Calculator {
	_BUTTONS = [
		[
			// 1行目
			nodeDataDict.gamma.clone(),
			nodeDataDict.rand.clone(),
			nodeDataDict.pi.clone(),
			nodeDataDict.tau.clone(),
			nodeDataDict.e.clone(),
			{ label: "AC", type: "clear", func: () => this._calcInit() },
			{ label: "BS", key: "Backspace", type: "clear", func: () => this._key_BS() },
		],
		[
			// 2行目
			nodeDataDict.exp.clone(),
			nodeDataDict.exp2.clone(),
			nodeDataDict.expm1.clone(),
			nodeDataDict.sin.clone(),
			nodeDataDict.cos.clone(),
			nodeDataDict.tan.clone(),
		],
		[
			// 3行目
			nodeDataDict.nthRoot.clone(),
			nodeDataDict.sqrt.clone(),
			nodeDataDict.asin.clone(),
			nodeDataDict.acos.clone(),
			nodeDataDict.atan.clone(),
			nodeDataDict.atan2.clone(),
		],
		[
			// 4行目
			nodeDataDict.pow.clone(),
			nodeDataDict.pow2.clone(),
			nodeDataDict.ln.clone(),
			nodeDataDict.log.clone(),
			nodeDataDict.log10.clone(),
			nodeDataDict.log2.clone(),
		],
		[
			// 5行目
			nodeDataDict.pow10.clone(),
			nodeDataDict["7"].clone(),
			nodeDataDict["8"].clone(),
			nodeDataDict["9"].clone(),
			nodeDataDict["("].clone(),
			nodeDataDict.mod.clone(),
		],
		[
			// 6行目
			nodeDataDict.abs.clone(),
			nodeDataDict["4"].clone(),
			nodeDataDict["5"].clone(),
			nodeDataDict["6"].clone(),
			nodeDataDict["*"].clone(),
			nodeDataDict["/"].clone(),
		],
		[
			// 7行目
			nodeDataDict.reciprocal.clone(),
			nodeDataDict["1"].clone(),
			nodeDataDict["2"].clone(),
			nodeDataDict["3"].clone(),
			nodeDataDict["+"].clone(),
			nodeDataDict["-"].clone(),
		],
		[
			// 8行目
			nodeDataDict["!"].clone(),
			nodeDataDict["."].clone(),
			nodeDataDict["0"].clone(),
			{ label: "=", key: ["=", "Enter"], type: "equal", func: () => this._key_Enter() },
			{ label: "←", key: "ArrowLeft", type: "cursor", func: () => this._key_Left() },
			{ label: "→", key: "ArrowRight", type: "cursor", func: () => this._key_Right() },
		],
	];

	/**
	 * 接頭語
	 * @type {string}
	 */
	PREFIX = "JLS_";

	/**
	 * @param {string | HTMLElement} root
	 */
	constructor(root) {
		this._root = jasc.acq(root);
		if (Array.isArray(root)) this._root = root[0];
		if (!root) this._root = document.body;

		/** @type {Map<string, HTMLButtonElement>} */
		this._keyMap = new Map();

		this._log = new JavaLibraryScript.libs.sys.Logger("Calc", JavaLibraryScript.libs.sys.Logger.LOG_LEVEL.LOG);

		this.precision = 20n;
		this.exPrecision = 2n;
		this.roundMode = 4;

		this._init();
		this._calcInit();

		this.BigFloat = JavaLibraryScript?.math?.BigFloat;
	}

	/**
	 * 接頭語つけるだけ
	 * @param {string} name
	 * @returns {string}
	 */
	_generateName(name) {
		return `${this.PREFIX}${name}`;
	}

	_init() {
		const precDiv = document.createElement("div");
		precDiv.classList.add(this._generateName("precDiv"));

		const precLabel = document.createElement("label");
		precLabel.textContent = "小数点以下桁数:";
		precDiv.appendChild(precLabel);

		const precInput = document.createElement("input");
		precInput.type = "number";
		precInput.value = this.precision.toString();
		precInput.addEventListener("input", (e) => {
			this.precision = parseInt(e.target.value || 0);
			this._key_Enter();
		});
		precDiv.appendChild(precInput);

		const exPrecLabel = document.createElement("label");
		exPrecLabel.textContent = "追加精度:";
		precDiv.appendChild(exPrecLabel);

		const exPrecInput = document.createElement("input");
		exPrecInput.type = "number";
		exPrecInput.value = this.exPrecision.toString();
		exPrecInput.addEventListener("input", (e) => {
			this.exPrecision = BigInt(parseInt(e.target.value || 0));
			this._key_Enter();
		});
		precDiv.appendChild(exPrecInput);

		const roundModeLabel = document.createElement("label");
		roundModeLabel.textContent = "丸めモード:";
		precDiv.appendChild(roundModeLabel);

		const roundModeSelect = document.createElement("select");

		roundModeSelect.addEventListener("change", (e) => {
			this.roundMode = e.target.selectedIndex;
			this._key_Enter();
		});

		const roundModeOptions = ["絶対値が小さい方向に切り捨て(truncate/down)", "絶対値が大きい方向に切り上げ(up)", "正の無限大方向に切り上げ(ceil)", "負の無限大方向に切り捨て(floor)", "四捨五入(halfUp)", "五捨六入(halfDown)"];
		for (const option of roundModeOptions) {
			const optionElement = document.createElement("option");
			optionElement.value = option;
			optionElement.textContent = option;
			roundModeSelect.appendChild(optionElement);
		}

		roundModeSelect.selectedIndex = this.roundMode;

		precDiv.appendChild(roundModeSelect);

		this._root.appendChild(precDiv);

		const display = document.createElement("div");
		display.classList.add(this._generateName("display"));
		this._root.appendChild(display);
		/** @type {HTMLDivElement} */
		this._display = display;

		const output = document.createElement("div");
		output.classList.add(this._generateName("output"));
		this._root.appendChild(output);
		/** @type {HTMLDivElement} */
		this._output = output;

		const container = document.createElement("div");
		container.classList.add(this._generateName("btn-grid"));

		for (let row of this._BUTTONS) {
			const rowContainer = document.createElement("div");
			rowContainer.classList.add(this._generateName("btn-row"));
			for (let item of row) {
				const btn = document.createElement("input");

				const { label, key, type } = item;

				btn.value = label;
				btn.type = "button";

				const classList = btn.classList;
				classList.add(this._generateName("btn"));
				if (type) {
					classList.add(this._generateName(`btn-${type}`));
				} else {
					classList.add("disabled");
				}

				btn.addEventListener("click", (e) => this._handleKey(e, item));
				if (key !== undefined) {
					let keys = Array.isArray(key) ? key : [key];
					for (let key of keys) {
						if (this._keyMap.has(key)) {
							this._log.warn(`duplicate key: ${key}`);
						}
						this._keyMap.set(key, btn);
					}
				}

				rowContainer.appendChild(btn);
			}
			container.appendChild(rowContainer);
		}

		// 軽量化の為に最後に追加
		this._root.appendChild(container);

		window.addEventListener("keydown", (e) => this._handleKeydown(e));
	}

	_handleKeydown(e) {
		const key = e.key;

		const active = document.activeElement;
		// フォーカス中の要素が入力系ならスキップ
		if (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable) {
			switch (key) {
				case "Enter":
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
				case "8":
				case "9":
				case "0":
				case "Backspace":
				case "Delete":
				case "Escape":
				case "ArrowLeft":
				case "ArrowRight":
				case "ArrowUp":
				case "ArrowDown":
					return; // 何もしない（スキップ）
			}
		}

		const btn = this._keyMap.get(key);
		if (btn) {
			btn.classList.add("active");
			setTimeout(() => btn.classList.remove("active"), 100);
			btn.click();
		}
	}

	_handleKey(e, item) {
		e.target.blur();
		switch (item.type) {
			case undefined:
				throw new Error(`item.type is required: ${item}`);
			case "clear":
			case "cursor":
			case "equal":
				item.func();
				break;
			default:
				this._cursor.insertAtCursor(item.clone());
		}

		this._updateDisplay();
	}

	_calcInit() {
		/** @type {Node} */
		this._rootNode = new Node({ disp: "", argLength: 1, type: "root" }, null, []);
		/** @type {Cursor} */
		this._cursor = new Cursor(this._rootNode, 0, 0);

		this._updateDisplay();
	}

	_flatten(node = this._rootNode) {
		const cursor = this._cursor;
		const result = [];

		const isCursorHere = (parent, slot, index) => cursor?.parent === parent && cursor.argSlotIndex === slot && cursor.index === index;

		/**
		 * @param {Node} n
		 * @param {Node | null} parentNode
		 * @param {number | null} slotIndex
		 * @param {number | null} indexInSlot
		 */
		const traverse = (n, parentNode = null, slotIndex = null, indexInSlot = null) => {
			if (isCursorHere(parentNode, slotIndex, indexInSlot)) {
				result.push({ node: null, role: "cursor", disp: "|" });
			}

			switch (n.type) {
				case "root":
					const child = n.children[0];
					if (child.length !== 0) {
						traverse(child);
					}
					break;
				case "func":
				case "struct-func":
				case "bracket":
					result.push({ node: n, role: `${n.type}-open`, disp: `${n.disp}(` });

					for (let i = 0; i < n.children.length; i++) {
						if (i > 0) result.push({ node: n, role: "comma", disp: "," });
						const child = n.children[i];

						if (child.length === 0) {
							if (isCursorHere(n, i, 0)) {
								result.push({ node: null, role: "cursor", disp: "|" });
							}
							result.push({ node: n, role: "placeholder", disp: "&nbsp;" });
							continue;
						}
						for (let j = 0; j < child.length; j++) {
							traverse(child[j], n, i, j);
						}
						if (isCursorHere(n, i, child.length)) {
							result.push({ node: null, role: "cursor", disp: "|" });
						}
					}
					result.push({ node: n, role: `${n.type}-close`, disp: ")" });
					break;
				case "static":
					result.push({ node: n, role: "static", disp: n.disp });
					break;
				default:
					result.push({ node: n, role: "self", disp: n.disp });
			}
		};
		node.children.forEach((slot, slotIdx) => {
			for (let j = 0; j < slot.length; j++) {
				traverse(slot[j], node, slotIdx, j);
			}
			if (isCursorHere(node, slotIdx, slot.length)) {
				result.push({ node: null, role: "cursor", disp: "|" });
			}
		});
		return result;
	}

	_updateDisplay() {
		const display = this._display;
		const flat = this._flatten();
		const cursorName = this._generateName("disp-cursor");
		let html = "";
		for (let i = 0, li = flat.length; i < li; i++) {
			const item = flat[i];
			if (item.role === "cursor") {
				html += `<span class="${cursorName}">&nbsp;</span>`;
				continue;
			}
			let cls = this._generateName(`disp-item-${item.role}`);
			html += `<span class="${cls}" data-index="${i}">${item.disp}</span>`;
		}
		display.innerHTML = html;

		display.querySelectorAll("span[data-index]").forEach((span) => {
			span.addEventListener("click", (e) => {
				const idx = parseInt(span.getAttribute("data-index"));
				this._setCursorFromDisplayIndex(idx);
			});
		});

		jasc.requestAnimationFrame(() => {
			const cursor = display.querySelector(`.${cursorName}`);
			if (cursor) {
				const cursorRight = cursor.offsetLeft + cursor.offsetWidth;
				const displayWidth = display.clientWidth;
				const padding = 10;
				const targetScroll = Math.max(0, cursorRight + padding - displayWidth);
				display.scrollLeft = targetScroll;
			}
		});
	}

	/**
	 * フラット表示の index から Cursor を復元する
	 * @param {number} displayIndex
	 */
	_setCursorFromDisplayIndex(displayIndex) {
		const flat = this._flatten(); // 表示に使われた配列
		if (displayIndex < 0 || displayIndex > flat.length) return;

		// flat の要素は { node, role, disp } なので、どの Node・slot・index かを復元する
		let count = 0;

		const findCursor = (node) => {
			if (node.type === "func" || node.type === "struct-func") {
				for (let i = 0; i < node.children.length; i++) {
					const slot = node.children[i];
					if (count === displayIndex) {
						return new Cursor(node, i, 0);
					}
					if (slot.length === 0) {
						count++;
					} else {
						for (let j = 0; j < slot.length; j++) {
							const child = slot[j];
							const cur = findCursor(child);
							if (cur) return cur;
						}
					}
					count++; // comma or close
				}
				count++; // close
			} else {
				if (count === displayIndex) {
					// 自分の前
					const argSlotIndex = node.parent.children.findIndex((slot) => slot.includes(node));
					const index = argSlotIndex !== -1 ? node.parent.children[argSlotIndex].indexOf(node) : 0;
					return new Cursor(node.parent, argSlotIndex, index);
				}
				count++; // 自分
			}
			return null;
		};

		const root = this._rootNode.children.flat(); // top level
		for (const node of root) {
			const cur = findCursor(node);
			if (cur) {
				this._cursor.parent = cur.parent;
				this._cursor.argSlotIndex = cur.argSlotIndex;
				this._cursor.index = cur.index;
				this._updateDisplay();
				break;
			}
		}
	}

	_key_BS() {
		this._cursor.deleteLeft();
	}

	_key_Left() {
		this._cursor.moveLeft();
	}

	_key_Right() {
		this._cursor.moveRight();
	}

	_key_Enter() {
		try {
			this.BigFloat.config.extraPrecision = this.exPrecision;
			this.BigFloat.config.roundingMode = this.roundMode;

			const result = this.calculate(this.precision);

			const sc_res = result.scale().toString();

			const [int, frac] = sc_res.split(".");

			let html = `<span class="${this._generateName("out-integer")}">${int}</span>`;
			if (frac?.length > 0) {
				html += `<span class="${this._generateName("out-fraction")}">.${frac}</span>`;
			}

			this._output.innerHTML = html;
		} catch (error) {
			this._log.error("Parsing failed:", error);
			this._output.innerHTML = `<span class="${this._generateName("out-error")}">エラー: ${error.message}</span>`;
		}
	}

	/**
	 * 現在の式を構文解析し、指定された精度で計算を実行します。
	 * 結果はBigFloatオブジェクトとして返され、コンソールにも出力されます。
	 *
	 * @param {BigInt} [precision=20n] 計算に使用する精度。
	 * @returns {BigFloat} 計算結果のBigFloatオブジェクト。
	 * @throws {Error} パースエラーや計算エラーが発生した場合。
	 */
	calculate(precision = 20n) {
		const BigFloat = this.BigFloat;
		if (typeof BigFloat === "undefined") {
			throw new Error("BigFloatクラスが読み込まれていません。BigFloat.jsを先に読み込んでください。");
		}

		try {
			// 1. 式を構文解析して木構造に変換
			const parsedTree = this.parse();
			if (!parsedTree.children[0] || parsedTree.children[0].length === 0) {
				return new BigFloat("0", precision); // 式が空の場合は0を返す
			}

			// 2. 構文木を再帰的に評価（計算）
			const result = this._evaluate(parsedTree, precision);

			return result;
		} catch (error) {
			this._log.error("Calculation failed:", error);
			throw error; // エラーを再スロー
		}
	}

	/**
	 * ノードツリーを再帰的に評価（計算）する内部メソッド。
	 *
	 * @param {Node} node - 評価対象のノード。
	 * @param {BigInt} precision - 計算精度。
	 * @returns {BigFloat} 評価結果のBigFloatオブジェクト。
	 * @private
	 */
	_evaluate(node, precision) {
		const BigFloat = this.BigFloat;
		switch (node.type) {
			case "root":
				// ルートノードの場合、最初の子要素を評価します
				return this._evaluate(node.children[0][0], precision);

			case "unary_op": {
				const operand = this._evaluate(node.children[0][0], precision);
				switch (node.key) {
					case "neg":
						return operand.neg(); // BigFloatのneg()メソッドで符号反転
					default:
						throw new Error(`未定義の単項演算子です: ${node.key}`);
				}
			}

			case "num":
				// 数値ノードをBigFloatオブジェクトに変換します
				return new BigFloat(node.disp, precision);

			case "static": // π, e
				switch (node.key) {
					case "P": // π
						return BigFloat.pi(precision);
					case "T": // τ
						return BigFloat.tau(precision);
					case "E": // e
						return BigFloat.e(precision);
					default:
						throw new Error(`未定義の静的値です: ${node.disp}`);
				}

			case "op": {
				// 二項演算子
				const left = this._evaluate(node.children[0][0], precision);
				const right = this._evaluate(node.children[1][0], precision);
				switch (node.key) {
					case "+":
						return left.add(right);
					case "-":
						return left.sub(right);
					case "*":
						return left.mul(right);
					case "/":
						return left.div(right);
					case "%":
						return left.mod(right);
					case "^":
						return left.pow(right);
					default:
						throw new Error(`未定義の演算子です: ${node.disp}`);
				}
			}

			case "func":
			case "struct-func": {
				// 関数の引数をすべて評価します
				const args = node.children.flat().map((childNode) => this._evaluate(childNode, precision));

				// node.disp (または label) に応じて適切な関数を呼び出します
				switch (node.disp) {
					// 1引数関数
					case "sqrt":
						return args[0].sqrt();
					case "abs":
						return args[0].abs();
					case "reciprocal":
						return args[0].reciprocal();
					case "exp":
						return args[0].exp();
					case "exp2":
						return args[0].exp2();
					case "expm1":
						return args[0].expm1();
					case "ln":
						return args[0].ln();
					case "gamma":
						return args[0].gamma();
					case "sin":
						return args[0].sin();
					case "cos":
						return args[0].cos();
					case "tan":
						return args[0].tan();
					case "asin":
						return args[0].asin();
					case "acos":
						return args[0].acos();
					case "atan":
						return args[0].atan();
					case "factorial":
						return args[0].factorial();

					// 2引数以上の関数
					case "pow":
						// 通常の pow(x, y)
						return args[0].pow(args[1]);
					case "atan2":
						return args[0].atan2(args[1]);

					case "nthRoot": // n√x -> x.nthRoot(n)
						return args[1].nthRoot(args[0].toNumber() | 0); // BigFloat.nthRootはnをNumber/BigIntで受け取ります

					case "log": // log_b(x) -> x.log(b)
						return args[1].log(args[0]);

					// 0引数関数
					case "rand":
						return BigFloat.random(precision);

					default:
						throw new Error(`未定義の関数です: ${node.disp}`);
				}
			}

			case "bracket": // typeが"bracket"の場合
				const args = node.children.flat().map((childNode) => this._evaluate(childNode, precision));
				return args[0]; // 括弧の中身をそのまま返します

			default:
				throw new Error(`評価できないノードタイプです: ${node.type}`);
		}
	}

	/**
	 * 現在のノードツリーを構文解析し、演算子の優先順位に基づいた新しい木構造を生成します。
	 * @returns {Node} 構文解析された新しいルートノード。
	 * @throws {Error} 構文エラーがある場合にスローされます。
	 */
	parse() {
		// _rootNode.children[0] にユーザーが入力したノードのリストが格納されています
		const nodesToParse = this._rootNode.children[0];
		if (nodesToParse.length === 0) {
			return this._rootNode.clone(); // 入力が空の場合は何もせず終了
		}

		// 式の解析を実行します
		const parsedChildren = this._parseExpression(nodesToParse);

		// 解析結果は、単一のルートを持つ木にまとめられているはずです
		if (parsedChildren.length !== 1) {
			this._log.error("Final parsed result is not a single tree:", parsedChildren);
			throw new Error("式が不完全です。");
		}

		// 新しいルートノードを作成し、解析済みの木を子として設定します
		const newRoot = new Node({ type: "root", argLength: 1 });
		newRoot.children[0] = parsedChildren;

		return newRoot;
	}

	/**
	 * ノードの配列（式）を、演算子の優先順位を考慮して解析します。(Shunting-yardベース)
	 * @param {Node[]} nodes - 解析対象のノード配列。
	 * @returns {Node[]} 解析されて木構造になったノードの配列。
	 * @private
	 */
	_parseExpression(nodes) {
		const values = []; // 値（オペランド）を格納するスタック
		const ops = []; // 演算子を格納するスタック

		// 演算子の優先順位と結合規則を定義
		const precedence = {
			neg: 4, // 単項マイナス (unary minus)
			"^": 3, // べき乗
			"*": 2,
			"/": 2,
			"%": 2,
			"+": 1,
			"-": 1,
		};
		const associativity = {
			neg: "R", // 右結合
			"^": "R",
			"*": "L",
			"/": "L",
			"%": "L",
			"+": "L",
			"-": "L",
		};

		// スタックから演算子と値を取り出し、部分木を構築して値スタックに戻すヘルパー関数
		const applyOp = () => {
			const op = ops.pop();

			if (op.type === "unary_op") {
				const operand = values.pop();
				if (operand === undefined) throw new Error(`単項演算子「${op.disp}」に対するオペランドがありません。`);

				const newNode = new Node({ key: op.key, disp: op.disp, type: op.type, argLength: 1, args: [[operand]] });
				values.push(newNode);
			} else {
				// type === 'op' (二項演算子)
				const right = values.pop();
				const left = values.pop();
				if (left === undefined || right === undefined) throw new Error(`二項演算子「${op.disp}」に対するオペランドがありません。`);

				const newNode = new Node({ key: op.key, disp: op.disp, type: op.type, argLength: 2, args: [[left], [right]] });
				values.push(newNode);
			}
		};

		// --- 1. 前処理: 数値ノードの結合と単項マイナスの特定 ---
		const processedNodes = [];
		let currentNumber = "";
		const flushNumber = () => {
			if (currentNumber !== "") {
				processedNodes.push(NodeDict.get(currentNumber));
				currentNumber = "";
			}
		};

		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (node.type === "num" || node.type === "dot") {
				currentNumber += node.disp;
				continue;
			}
			flushNumber();

			if (node.key === "+" || node.key === "-") {
				const prevProcessedNode = processedNodes.length > 0 ? processedNodes[processedNodes.length - 1] : null;

				// 単項演算子かを判定: 式の先頭、または直前が二項/単項演算子の場合。
				// 値(数値、関数、定数など)の直後に来る +/- は二項演算子とみなす。
				const isUnary = !prevProcessedNode || prevProcessedNode.type === "op" || prevProcessedNode.type === "unary_op";

				if (isUnary) {
					if (node.key === "-") {
						// 単項マイナスは 'neg' というキーを持つ単項演算子ノードとして追加
						const unaryMinusNode = new Node({ key: "neg", disp: "-", type: "unary_op", argLength: 1 });
						processedNodes.push(unaryMinusNode);
					}
					// 単項プラス(+)は、計算に影響しないため無視する
				} else {
					// 二項演算子としてそのまま追加
					processedNodes.push(node);
				}
			} else {
				processedNodes.push(node);
			}
		}
		flushNumber();

		// --- 2. メインの解析ループ ---
		for (const node of processedNodes) {
			if (["num", "static"].includes(node.type)) {
				values.push(node);
			} else if (["func", "struct-func", "bracket"].includes(node.type)) {
				// (ここは元々のロジックと同じですが、一応記載)
				const newNode = node.clone();
				newNode.children = [];
				for (const argSlot of node.children) {
					const parsedArgSlot = this._parseExpression(argSlot);
					newNode.children.push(parsedArgSlot);
				}
				values.push(newNode);
			} else if (node.type === "op" || node.type === "unary_op") {
				const opKey = node.key;
				while (ops.length > 0 && (ops[ops.length - 1].type === "op" || ops[ops.length - 1].type === "unary_op") && (precedence[ops[ops.length - 1].key] > precedence[opKey] || (precedence[ops[ops.length - 1].key] === precedence[opKey] && associativity[opKey] === "L"))) {
					applyOp();
				}
				ops.push(node);
			}
		}

		// --- 3. ループ終了後、スタックに残った演算子をすべて処理 ---
		while (ops.length > 0) {
			if (!["op", "unary_op"].includes(ops[ops.length - 1].type)) {
				throw new Error("括弧の対応が正しくありません。");
			}
			applyOp();
		}

		return values;
	}
}
