jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"hoang/com/CreateProjects/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"hoang/com/CreateProjects/test/integration/pages/App",
	"hoang/com/CreateProjects/test/integration/pages/Browser",
	"hoang/com/CreateProjects/test/integration/pages/Master",
	"hoang/com/CreateProjects/test/integration/pages/Detail",
	"hoang/com/CreateProjects/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "hoang.com.CreateProjects.view."
	});

	sap.ui.require([
		"hoang/com/CreateProjects/test/integration/NavigationJourneyPhone",
		"hoang/com/CreateProjects/test/integration/NotFoundJourneyPhone",
		"hoang/com/CreateProjects/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});