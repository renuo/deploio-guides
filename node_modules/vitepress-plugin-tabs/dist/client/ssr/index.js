import { computed, defineComponent, inject, mergeProps, nextTick, onBeforeMount, onMounted, onUnmounted, provide, reactive, ref, toRef, unref, useId, useSSRContext, useSlots, watch } from "vue";
import { ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderList, ssrRenderSlot } from "vue/server-renderer";

//#region src/client/useStabilizeScrollPosition.ts
const useStabilizeScrollPosition = (targetEle) => {
	if (typeof document === "undefined") {
		const mock = (f) => async (...args) => f(...args);
		return { stabilizeScrollPosition: mock };
	}
	const scrollableEleVal = document.documentElement;
	const stabilizeScrollPosition = (func) => async (...args) => {
		const result = func(...args);
		const eleVal = targetEle.value;
		if (!eleVal) return result;
		const offset = eleVal.offsetTop - scrollableEleVal.scrollTop;
		await nextTick();
		scrollableEleVal.scrollTop = eleVal.offsetTop - offset;
		return result;
	};
	return { stabilizeScrollPosition };
};

//#endregion
//#region src/client/useTabsSelectedState.ts
const injectionKey$1 = "vitepress:tabSharedState";
const ls = typeof localStorage !== "undefined" ? localStorage : null;
const localStorageKey = "vitepress:tabsSharedState";
const getLocalStorageValue = () => {
	const rawValue = ls?.getItem(localStorageKey);
	if (rawValue) try {
		return JSON.parse(rawValue);
	} catch {}
	return {};
};
const setLocalStorageValue = (v) => {
	if (!ls) return;
	ls.setItem(localStorageKey, JSON.stringify(v));
};
const provideTabsSharedState = (app) => {
	const state = reactive({});
	watch(() => state.content, (newStateContent, oldStateContent) => {
		if (newStateContent && oldStateContent) setLocalStorageValue(newStateContent);
	}, { deep: true });
	app.provide(injectionKey$1, state);
};
const useTabsSelectedState = (acceptValues, sharedStateKey) => {
	const sharedState = inject(injectionKey$1);
	if (!sharedState) throw new Error("[vitepress-plugin-tabs] TabsSharedState should be injected");
	onMounted(() => {
		if (!sharedState.content) sharedState.content = getLocalStorageValue();
	});
	const nonSharedState = ref();
	const selected = computed({
		get() {
			const key = sharedStateKey.value;
			const acceptVals = acceptValues.value;
			if (key) {
				const value = sharedState.content?.[key];
				if (value && acceptVals.includes(value)) return value;
			} else {
				const nonSharedStateVal = nonSharedState.value;
				if (nonSharedStateVal) return nonSharedStateVal;
			}
			return acceptVals[0];
		},
		set(v) {
			const key = sharedStateKey.value;
			if (key) {
				if (sharedState.content) sharedState.content[key] = v;
			} else nonSharedState.value = v;
		}
	});
	const select = (newValue) => {
		selected.value = newValue;
	};
	return {
		selected,
		select
	};
};

//#endregion
//#region src/client/useTabLabels.ts
function useTabLabels() {
	const slots = useSlots();
	return computed(() => {
		const defaultSlot = slots.default?.();
		if (!defaultSlot) return [];
		return defaultSlot.filter((vnode) => typeof vnode.type === "object" && "__name" in vnode.type && vnode.type.__name === "PluginTabsTab" && vnode.props).map((vnode) => vnode.props?.label);
	});
}

//#endregion
//#region src/client/useTabsSingleState.ts
const injectionKey = "vitepress:tabSingleState";
const provideTabsSingleState = (state) => {
	provide(injectionKey, state);
};
const useTabsSingleState = () => {
	const singleState = inject(injectionKey);
	if (!singleState) throw new Error("[vitepress-plugin-tabs] TabsSingleState should be injected");
	return singleState;
};

//#endregion
//#region src/client/useIsPrint.ts
const useIsPrint = () => {
	const matchMedia = typeof window !== "undefined" ? window.matchMedia("print") : void 0;
	const value = ref(matchMedia?.matches);
	const listener = () => {
		value.value = matchMedia?.matches;
	};
	onBeforeMount(() => {
		matchMedia?.addEventListener("change", listener);
	});
	onUnmounted(() => {
		matchMedia?.removeEventListener("change", listener);
	});
	return value;
};

//#endregion
//#region src/client/PluginTabs.vue?vue&type=script&setup=true&lang.ts
var PluginTabs_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "PluginTabs",
	__ssrInlineRender: true,
	props: { sharedStateKey: {} },
	setup(__props) {
		const props = __props;
		const isPrint = useIsPrint();
		const tabLabels = useTabLabels();
		const { selected, select } = useTabsSelectedState(tabLabels, toRef(props, "sharedStateKey"));
		const tablist = ref();
		const { stabilizeScrollPosition } = useStabilizeScrollPosition(tablist);
		stabilizeScrollPosition(select);
		ref([]);
		const uid = useId();
		provideTabsSingleState({
			uid,
			selected
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "plugin-tabs" }, _attrs))}><div class="plugin-tabs--tab-list" role="tablist"><!--[-->`);
			ssrRenderList(unref(tabLabels), (tabLabel) => {
				_push(`<button${ssrRenderAttr("id", `tab-${tabLabel}-${unref(uid)}`)} role="tab" class="plugin-tabs--tab"${ssrRenderAttr("aria-selected", tabLabel === unref(selected) && !unref(isPrint))}${ssrRenderAttr("aria-controls", `panel-${tabLabel}-${unref(uid)}`)}${ssrRenderAttr("tabindex", tabLabel === unref(selected) ? 0 : -1)}>${ssrInterpolate(tabLabel)}</button>`);
			});
			_push(`<!--]--></div>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
});

//#endregion
//#region src/client/PluginTabs.vue
const _sfc_setup$1 = PluginTabs_vue_vue_type_script_setup_true_lang_default.setup;
PluginTabs_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/client/PluginTabs.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var PluginTabs_default = PluginTabs_vue_vue_type_script_setup_true_lang_default;

//#endregion
//#region src/client/PluginTabsTab.vue?vue&type=script&setup=true&lang.ts
var PluginTabsTab_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "PluginTabsTab",
	__ssrInlineRender: true,
	props: { label: {} },
	setup(__props) {
		const { uid, selected } = useTabsSingleState();
		const isPrint = useIsPrint();
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(selected) === _ctx.label || unref(isPrint)) {
				_push(`<div${ssrRenderAttrs(mergeProps({
					id: `panel-${_ctx.label}-${unref(uid)}`,
					class: "plugin-tabs--content",
					role: "tabpanel",
					tabindex: "0",
					"aria-labelledby": `tab-${_ctx.label}-${unref(uid)}`,
					"data-is-print": unref(isPrint)
				}, _attrs))} data-v-3044dfca>`);
				ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
				_push(`</div>`);
			} else _push(`<!---->`);
		};
	}
});

//#endregion
//#region \0/plugin-vue/export-helper
var export_helper_default = (sfc, props) => {
	const target = sfc.__vccOpts || sfc;
	for (const [key, val] of props) target[key] = val;
	return target;
};

//#endregion
//#region src/client/PluginTabsTab.vue
const _sfc_setup = PluginTabsTab_vue_vue_type_script_setup_true_lang_default.setup;
PluginTabsTab_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/client/PluginTabsTab.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PluginTabsTab_default = /* @__PURE__ */ export_helper_default(PluginTabsTab_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3044dfca"]]);

//#endregion
//#region src/client/index.ts
const enhanceAppWithTabs = (app) => {
	provideTabsSharedState(app);
	app.component("PluginTabs", PluginTabs_default);
	app.component("PluginTabsTab", PluginTabsTab_default);
};

//#endregion
export { enhanceAppWithTabs };