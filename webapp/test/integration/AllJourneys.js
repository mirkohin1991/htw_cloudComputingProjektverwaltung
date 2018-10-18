jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 ProjectSet in the list
// * All 3 ProjectSet have at least one WorkPackageSet

sap.ui.require([
	"sap/ui/test/Opa5",
	"hoang/com/CreateProjects/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"hoang/com/CreateProjects/test/integration/pages/App",
	"hoang/com/CreateProjects/test/integration/pages/Browser",
	"hoang/com/CreateProjects/test/integration/pages/Master",
	"hoang/com/CreateProjects/test/integration/pages/Detail",
	"hoang/com/CreateProjects/test/integration/pages/Create",
	"hoang/com/CreateProjects/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "hoang.com.CreateProjects.view."
	});

	sap.ui.require([
		"hoang/com/CreateProjects/test/integration/MasterJourney",
		"hoang/com/CreateProjects/test/integration/NavigationJourney",
		"hoang/com/CreateProjects/test/integration/NotFoundJourney",
		"hoang/com/CreateProjects/test/integration/BusyJourney",
		"hoang/com/CreateProjects/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});