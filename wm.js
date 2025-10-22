const WM_ENV = (typeof window !== "undefined" ? window : globalThis);

if (!WM_ENV.aware) {
	WM_ENV.aware = {};
WM_ENV.aware.cdr = {};
WM_ENV.aware.cdr[0] = {};
WM_ENV.aware.cdr[0][0] = {};
WM_ENV.aware.cdr[0].mpx = {};
WM_ENV.aware.cdr[0].mpx[0] = {};
WM_ENV.aware.cdr[0][0].stack = {};
WM_ENV.aware.cdr[0][0][0] = {};
WM_ENV.aware.cdr[0][0][0][0] = WM_ENV.aware.cdr[0][0];
WM_ENV.aware.cdr[0][0].stack[0] = {};
WM_ENV.aware.cdr[0].mpx[0][0] = {};
WM_ENV.aware.cdr.before = WM_ENV.aware.cdr[0];
WM_ENV.aware.cdr.before.mpx[0][0][0] = {};
WM_ENV.aware.cdr.before.mpx[0][0][0].before = WM_ENV.aware.cdr.before[0].stack[0];
WM_ENV.aware.cdr.before[0][0].tmp = WM_ENV.aware.cdr.before.mpx[0][0][0];
WM_ENV.aware.cdr.before[0].stack.other = WM_ENV.aware.cdr.before.mpx[0];
WM_ENV.aware.cdr.before[0].stack[0].aware = {};
WM_ENV.aware.cdr.before[0].stack[0].aware.stack = WM_ENV.aware.cdr.before.mpx[0][0];
WM_ENV.aware.cdr.before.mpx[0][0].tree = {};
WM_ENV.aware.cdr.before[0].stack[0][0] = WM_ENV.aware.cdr.before[0][0];
WM_ENV.aware.cdr.before.mpx[0].mpx = {};
WM_ENV.aware.cdr.before.mpx[0].mpx.stack = WM_ENV.aware.cdr.before[0][0];
WM_ENV.aware.cdr.before.mpx.result = WM_ENV.aware.cdr.before[0];
WM_ENV.aware.cdr.before[0].stack[0].aware[0] = WM_ENV.aware.cdr.before.mpx[0];
WM_ENV.aware.cdr.before.mpx[0].mpx[0] = WM_ENV.aware;
WM_ENV.aware.cdr.before.mpx[0][0].tree[0] = WM_ENV.aware.cdr.before.mpx[0].mpx;
WM_ENV.aware.cdr.before[0][0].tmp[0] = WM_ENV.aware.cdr.before[0][0];
WM_ENV.aware.cdr.before.mpx[0][0].tree.tmp = WM_ENV.aware;

}




