function initModel() {
	var sUrl = "/S4HC/sap/opu/odata/cpd/SC_EXTERNAL_SERVICES_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}