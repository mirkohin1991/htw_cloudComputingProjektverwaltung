sap.ui.define([
	"hoang/com/CreateProjects/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"

], function (BaseController, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("hoang.com.CreateProjects.controller.CreateEntity", {

		_oBinding: {},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {
			var that = this;
			this.getRouter().getTargets().getTarget("create").attachDisplay(null, this._onDisplay, this);
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oResourceBundle = this.getResourceBundle();
			this._oViewModel = new JSONModel({
				enableCreate: false,
				delay: 0,
				busy: false,
				mode: "create",
				viewTitle: ""
			});
			this.setModel(this._oViewModel, "viewModel");

			// Register the view with the message manager
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			var oMessagesModel = sap.ui.getCore().getMessageManager().getMessageModel();
			this._oBinding = new sap.ui.model.Binding(oMessagesModel, "/", oMessagesModel.getContext("/"));
			this._oBinding.attachChange(function (oEvent) {
				var aMessages = oEvent.getSource().getModel().getData();
				for (var i = 0; i < aMessages.length; i++) {
					if (aMessages[i].type === "Error" && !aMessages[i].technical) {
						that._oViewModel.setProperty("/enableCreate", false);
					}
				}
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler (attached declaratively) for the view save button. Saves the changes added by the user. 
		 * @function
		 * @public
		 */
		onSave: function () {
			var that = this,
				oModel = this.getModel();

			// abort if the  model has not been changed
			if (!oModel.hasPendingChanges()) {
				MessageBox.information(
					this._oResourceBundle.getText("noChangesMessage"), {
						id: "noChangesInfoMessageBox",
						styleClass: that.getOwnerComponent().getContentDensityClass()
					}
				);
				return;
			}

			//	this.getModel("appView").setProperty("/busy", true);
			//	if (this._oViewModel.getProperty("/mode") === "edit") {
			//		// attach to the request completed event of the batch
			//		oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
			//			if (that._checkIfBatchRequestSucceeded(oEvent)) {
			//				that._fnUpdateSuccess();
			//			} else {
			//				that._fnEntityCreationFailed();
			//				MessageBox.error(that._oResourceBundle.getText("updateError"));
			//			}
			//		});
			//	}
			//	oModel.submitChanges();

			//	var ProjManagerExtId_id = sap.ui.getCore().byId("__xmlview0--ProjManagerExtId_id").getProperty("value");

			//SAMPLE DATA
			/*	"ProjectCategory": "C",
				"OrgID": "1010",
				"CostCenter": "0010101902",
				"ProfitCenter": "YB101",
				"Customer": "10100002",
				"Currency": "EUR",
				"ProjectID": "API3",
				"ProjectName": "ProjectAPI3",
				"ProjectStage": "P001",
				"ProjManagerExtId": "D063538",
				"StartDate": "2018-04-29T00:00:00.0000000",
				"EndDate": "2018-05-29T00:00:00.0000000"
			*/

			//	var url = "https://sandbox.api.sap.com/ml/translation/translation";

			/**					var settings = {
									"async": true,
									"crossDomain": true,
									"url": "/mlTranslationService/translation",
									"method": "POST",
									"headers": {
										"apikey": "bIz3xKOCcyoGpHucikNb5kr1CvWT7Bvh",
										"content-type": "application/json",
										"cache-control": "no-cache"
							//			"postman-token": "4b3e7d86-f357-6269-3c1b-171d4a589e42"
									},
									"processData": false,
									"data": "{\n  \"sourceLanguage\": \"de\",\n  \"targetLanguages\": [\n    \"en\"\n  ],\n  \"units\": [\n    {\n      \"value\": \"Projekt für Finanzbuchhaltung\",\n      \"key\": \"ANALYZE_SALES_DATA\"\n    }\n  ]\n}"
								};

								$.ajax(settings).done(function (response) {
									sap.m.MessageToast.show(response.units[0].translations[0].value) ;
								});
				**/

			var bodyLngDet = JSON.stringify({
				"message": sap.ui.getCore().byId("__xmlview0--ProjectName_id").getProperty("value")
			});

			var xhr = new XMLHttpRequest();
			xhr.withCredentials = true;

			xhr.addEventListener("readystatechange", function () {
				if (this.readyState === 4) {
					var langCode = JSON.parse(this.responseText).langCode;
					sap.m.MessageToast.show(langCode);

					var data = JSON.stringify({
						"sourceLanguage": langCode,
						"targetLanguages": [
							"en"
						],
						"units": [{
							"value": sap.ui.getCore().byId("__xmlview0--ProjectName_id").getProperty("value"),
							"key": "ANALYZE_SALES_DATA"
						}]
					});

					xhr = new XMLHttpRequest();
					xhr.withCredentials = true;

					xhr.addEventListener("readystatechange", function () {
						if (this.readyState === 4) {
							var translatedText = JSON.parse(this.responseText).units[0].translations[0].value;
							sap.m.MessageToast.show(translatedText);
							// console.log(this.responseText);

							var oModelNew = new sap.ui.model.odata.ODataModel("/S4HC/sap/opu/odata/cpd/SC_PROJ_ENGMT_CREATE_UPD_SRV/", true);
							var dateFrom = sap.ui.getCore().byId("__xmlview0--StartDate_id").getProperty("value");
							var dateFromISO = new Date(dateFrom).toISOString();
							var dateFromShort = dateFromISO.split(".")[0];
							var dateTo = sap.ui.getCore().byId("__xmlview0--EndDate_id").getProperty("value");
							var dateToISO = new Date(dateTo).toISOString();
							var dateToShort = dateToISO.split(".")[0];

							var ODataNew = {
								"ProjectCategory": sap.ui.getCore().byId("__xmlview0--ProjectCategory_id").getProperty("value"),
								"OrgID": sap.ui.getCore().byId("__xmlview0--OrgID_id").getProperty("value"),
								"CostCenter": sap.ui.getCore().byId("__xmlview0--CostCenter_id").getProperty("value"),
								"ProfitCenter": sap.ui.getCore().byId("__xmlview0--ProfitCenter_id").getProperty("value"),
								"Customer": sap.ui.getCore().byId("__xmlview0--Customer_id").getProperty("value"),
								"Currency": sap.ui.getCore().byId("__xmlview0--Currency_id").getProperty("value"),
								"ProjectID": sap.ui.getCore().byId("__xmlview0--ProjectID_id").getProperty("value"),
								"ProjectName": translatedText,
								"ProjectStage": sap.ui.getCore().byId("__xmlview0--ProjectStage_id").getProperty("value"),
								"ProjManagerExtId": sap.ui.getCore().byId("__xmlview0--ProjManagerExtId_id").getProperty("value"),
								"StartDate": dateFromShort,
								"EndDate": dateToShort
							};
							oModelNew.create("/ProjectSet", ODataNew, {
								success: function (oCreatedEntry) {
									sap.m.MessageToast.show("Creation successful");
								},
								error: function (oError) {
									sap.m.MessageBox.show(JSON.parse(oError.response.body).error.message.value);
									/* do something */
								}
							});

							//Does not work!
							oModel.refresh();
						}
					});

					xhr.open("POST", "/mlServices/translation/translation");
					xhr.setRequestHeader("Content-Type", "application/json");
					xhr.setRequestHeader("apikey", "ADwoLzuKGr0tLpz1OIsPKhTqSEwEccfc");
					//	xhr.setRequestHeader("cache-control", "no-cache");
					//	xhr.setRequestHeader("Postman-Token", "685d3dc8-e09e-4e2b-9b97-136ffe18d3cf");

					xhr.send(data);

				}
			});

			xhr.open("POST", "/mlServices/languagedetection/language");
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.setRequestHeader("apikey", "ADwoLzuKGr0tLpz1OIsPKhTqSEwEccfc");
			//	xhr.setRequestHeader("cache-control", "no-cache");
			//	xhr.setRequestHeader("Postman-Token", "685d3dc8-e09e-4e2b-9b97-136ffe18d3cf");

			xhr.send(bodyLngDet);

		},

		_checkIfBatchRequestSucceeded: function (oEvent) {
			var oParams = oEvent.getParameters();
			var aRequests = oEvent.getParameters().requests;
			var oRequest;
			if (oParams.success) {
				if (aRequests) {
					for (var i = 0; i < aRequests.length; i++) {
						oRequest = oEvent.getParameters().requests[i];
						if (!oRequest.success) {
							return false;
						}
					}
				}
				return true;
			} else {
				return false;
			}
		},

		/**
		 * Event handler (attached declaratively) for the view cancel button. Asks the user confirmation to discard the changes. 
		 * @function
		 * @public
		 */
		onCancel: function () {
			// check if the model has been changed
			if (this.getModel().hasPendingChanges()) {
				// get user confirmation first
				this._showConfirmQuitChanges(); // some other thing here....
			} else {
				this.getModel("appView").setProperty("/addEnabled", true);
				// cancel without confirmation
				this._navBack();
			}
		},

		/* =========================================================== */
		/* Internal functions
		/* =========================================================== */
		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Details page
		 * @private
		 */
		_navBack: function () {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			this.getView().unbindObject();
			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				this.getRouter().getTargets().display("object");
			}
		},

		/**
		 * Opens a dialog letting the user either confirm or cancel the quit and discard of changes.
		 * @private
		 */
		_showConfirmQuitChanges: function () {
			var oComponent = this.getOwnerComponent(),
				oModel = this.getModel();
			var that = this;
			MessageBox.confirm(
				this._oResourceBundle.getText("confirmCancelMessage"), {
					styleClass: oComponent.getContentDensityClass(),
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							that.getModel("appView").setProperty("/addEnabled", true);
							oModel.resetChanges();
							that._navBack();
						}
					}
				}
			);
		},

		/**
		 * Prepares the view for editing the selected object
		 * @param {sap.ui.base.Event} oEvent the  display event
		 * @private
		 */
		_onEdit: function (oEvent) {
			var oData = oEvent.getParameter("data"),
				oView = this.getView();
			this._oViewModel.setProperty("/mode", "edit");
			this._oViewModel.setProperty("/enableCreate", true);
			this._oViewModel.setProperty("/viewTitle", this._oResourceBundle.getText("editViewTitle"));

			oView.bindElement({
				path: oData.objectPath
			});
		},

		/**
		 * Prepares the view for creating new object
		 * @param {sap.ui.base.Event} oEvent the  display event
		 * @private
		 */

		_onCreate: function (oEvent) {
			if (oEvent.getParameter("name") && oEvent.getParameter("name") !== "create") {
				this._oViewModel.setProperty("/enableCreate", false);
				this.getRouter().getTargets().detachDisplay(null, this._onDisplay, this);
				this.getView().unbindObject();
				return;
			}

			this._oViewModel.setProperty("/viewTitle", this._oResourceBundle.getText("createViewTitle"));
			this._oViewModel.setProperty("/mode", "create");
			var oContext = this._oODataModel.createEntry("ProjectSet", {
				success: this._fnEntityCreated.bind(this),
				error: this._fnEntityCreationFailed.bind(this)
			});
			this.getView().setBindingContext(oContext);
		},

		/**
		 * Checks if the save button can be enabled
		 * @private
		 */
		_validateSaveEnablement: function () {
			var aInputControls = this._getFormFields(this.byId("newEntitySimpleForm"));
			var oControl;
			for (var m = 0; m < aInputControls.length; m++) {
				oControl = aInputControls[m].control;
				if (aInputControls[m].required) {
					var sValue = oControl.getValue();
					if (!sValue) {
						this._oViewModel.setProperty("/enableCreate", false);
						return;
					}
				}
			}
			this._checkForErrorMessages();
		},

		/**
		 * Checks if there is any wrong inputs that can not be saved.
		 * @private
		 */

		_checkForErrorMessages: function () {
			var aMessages = this._oBinding.oModel.oData;
			if (aMessages.length > 0) {
				var bEnableCreate = true;
				for (var i = 0; i < aMessages.length; i++) {
					if (aMessages[i].type === "Error" && !aMessages[i].technical) {
						bEnableCreate = false;
						break;
					}
				}
				this._oViewModel.setProperty("/enableCreate", bEnableCreate);
			} else {
				this._oViewModel.setProperty("/enableCreate", true);
			}
		},

		/**
		 * Handles the success of updating an object
		 * @private
		 */
		_fnUpdateSuccess: function () {
			this.getModel("appView").setProperty("/busy", false);
			this.getView().unbindObject();
			this.getRouter().getTargets().display("object");
		},

		/**
		 * Handles the success of creating an object
		 *@param {object} oData the response of the save action
		 * @private
		 */
		_fnEntityCreated: function (oData) {
			var sObjectPath = this.getModel().createKey("ProjectSet", oData);
			this.getModel("appView").setProperty("/itemToSelect", "/" + sObjectPath); //save last created
			this.getModel("appView").setProperty("/busy", false);
			this.getRouter().getTargets().display("object");
		},

		/**
		 * Handles the failure of creating/updating an object
		 * @private
		 */
		_fnEntityCreationFailed: function () {
			this.getModel("appView").setProperty("/busy", false);
		},

		/**
		 * Handles the onDisplay event which is triggered when this view is displayed 
		 * @param {sap.ui.base.Event} oEvent the on display event
		 * @private
		 */
		_onDisplay: function (oEvent) {
			var oData = oEvent.getParameter("data");
			if (oData && oData.mode === "update") {
				this._onEdit(oEvent);
			} else {
				this._onCreate(oEvent);
			}
		},

		/**
		 * Gets the form fields
		 * @param {sap.ui.layout.form} oSimpleForm the form in the view.
		 * @private
		 */
		_getFormFields: function (oSimpleForm) {
			var aControls = [];
			var aFormContent = oSimpleForm.getContent();
			var sControlType;
			for (var i = 0; i < aFormContent.length; i++) {
				sControlType = aFormContent[i].getMetadata().getName();
				if (sControlType === "sap.m.Input" || sControlType === "sap.m.DateTimeInput" ||
					sControlType === "sap.m.CheckBox") {
					aControls.push({
						control: aFormContent[i],
						required: aFormContent[i - 1].getRequired && aFormContent[i - 1].getRequired()
					});
				}
			}
			return aControls;
		}
	});

});