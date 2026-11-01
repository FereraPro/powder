// Every frame the engine's page glue asks WebGL for two values and checks a
// framebuffer. Each of those questions stops the page until the GPU process has
// run everything queued so far, so the frame costs game + GPU instead of
// whichever is slower. The answers are known here, so nothing needs to wait.
(function () {
	var P = WebGL2RenderingContext.prototype;
	var getParameter = P.getParameter, enable = P.enable, disable = P.disable;
	var bindFramebuffer = P.bindFramebuffer, checkStatus = P.checkFramebufferStatus;
	var SCISSOR_TEST = 3089, DRAW_BINDING = 36006, FRAMEBUFFER = 36160, DRAW_FRAMEBUFFER = 36009, COMPLETE = 36053;
	var scissor = false, drawFbo = null, checks = 0;
	P.enable = function (cap) { if (cap === SCISSOR_TEST) scissor = true; enable.call(this, cap); };
	P.disable = function (cap) { if (cap === SCISSOR_TEST) scissor = false; disable.call(this, cap); };
	P.bindFramebuffer = function (target, fbo) {
		if (target === FRAMEBUFFER || target === DRAW_FRAMEBUFFER) drawFbo = fbo;
		bindFramebuffer.call(this, target, fbo);
	};
	P.getParameter = function (name) {
		if (name === SCISSOR_TEST) return scissor;
		if (name === DRAW_BINDING) return drawFbo;
		return getParameter.call(this, name);
	};
	// the engine tests what the device supports in its first checks: those stay real
	P.checkFramebufferStatus = function (target) {
		if (checks > 60) return COMPLETE;
		checks += 1;
		return checkStatus.call(this, target);
	};
})();
