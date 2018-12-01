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

			/********* 
			 * 1. API CALL:  The app has to determine the source language of the provided text
			 **********/
			//Get the user input for the project name
			var httpBody = JSON.stringify({
				"message": sap.ui.getCore().byId("__xmlview0--ProjectName_id").getProperty("value")
			});
			//Create a new HTTP request
			var httpRequest = new XMLHttpRequest();
			httpRequest.withCredentials = true;
			//add an event listener so that we can react on the result
			httpRequest.addEventListener("readystatechange", this._eventListenerLangDetection.bind(this));
			//Open the connection to the service. The following relative path '/mlServices' is mapped in the destinations area of the cloud platfom to absolute path 
			//'https://sandbox.api.sap.com/ml'. In the neo-app.json file the link between the app and the cloud platform destination is maintained.
			httpRequest.open("POST", "/mlServices/languagedetection/language");
			//The content is requested in the JSON format. Additonally the API requires a unique key
			httpRequest.setRequestHeader("Content-Type", "application/json");
			httpRequest.setRequestHeader("apikey", "bIz3xKOCcyoGpHucikNb5kr1CvWT7Bvh");
			//Finally the http request is fired
			httpRequest.send(httpBody);

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
		},
		
		onBeforeRendering: function () {
		//Set the default values	
		sap.ui.getCore().byId("__xmlview0--ProjectCategory_id").setValue("C");
		sap.ui.getCore().byId("__xmlview0--OrgID_id").setValue("1010");
		sap.ui.getCore().byId("__xmlview0--CostCenter_id").setValue("0010101902");
		sap.ui.getCore().byId("__xmlview0--ProfitCenter_id").setValue("YB101");
		sap.ui.getCore().byId("__xmlview0--Customer_id").setValue("10100002");
		sap.ui.getCore().byId("__xmlview0--Currency_id").setValue("EUR");
						//The project name is now translated
		sap.ui.getCore().byId("__xmlview0--ProjectStage_id").setValue("P001");
		sap.ui.getCore().byId("__xmlview0--ProjManagerExtId_id").setValue("D063538");
		},

		/**
		 * Event Listener for the result handling of the language detection machine learning service
		 * @param event: object containing the event information (most importantly the HTTP result)
		 */
		_eventListenerLangDetection: function (event) {
			//We have to check for the readyState 4, meanining that this is the response event
			if (event.currentTarget.readyState === 4) {
				//First we have to parse the response into JSON format
				var parsedResponse = JSON.parse(event.currentTarget.responseText);
				//In case of error, an error popup is shown
				if (parsedResponse.hasOwnProperty("error")) {
					var errorMessage = parsedResponse.error.message;
					sap.m.MessageBox.show(errorMessage);
					//Check if the response contains the expected information	
				} else if (parsedResponse.hasOwnProperty("langCode")) {
					/********* 
					 * 3. API CALL: Text translation into english
					 **********/
					//Store the detected language
					var langCode = parsedResponse.langCode;
					//Bring the detected language to the UI
					sap.m.MessageToast.show(langCode);
					//Now we can prepare the second HTTP call to translate the text into english
					var data = JSON.stringify({
						"sourceLanguage": langCode, // detected input language
						"targetLanguages": [
							"en"
						],
						"units": [{
							"value": sap.ui.getCore().byId("__xmlview0--ProjectName_id").getProperty("value"), //This is the information that the user has entered on the UI
							"key": "PROJECT_TRANSL"
						}]
					});

					//Create a new HTTP request
					var httpRequest = new XMLHttpRequest();
					httpRequest.withCredentials = true;
					//add an event listener so that we can react on the result of the translation service
					httpRequest.addEventListener("readystatechange", this._eventListenerTranslation.bind(this));
					//Open the connection to the service. The following relative path '/mlServices' is mapped in the destinations area of the cloud platfom to absolute path 
					//'https://sandbox.api.sap.com/ml'. In the neo-app.json file the link between the app and the cloud platform destination is maintained.
					httpRequest.open("POST", "/mlServices/translation/translation");
					//The content is requested in the JSON format. Additonally the API requires a unique key
					httpRequest.setRequestHeader("Content-Type", "application/json");
					httpRequest.setRequestHeader("apikey", "bIz3xKOCcyoGpHucikNb5kr1CvWT7Bvh");
					//Finally the http request is fired
					httpRequest.send(data);
				}
			}
		},

		/**
		 * Event Listener for the result handling of the translation machine learning service
		 */
		_eventListenerTranslation: function (event) {
			//We have to check for the readyState 4, meanining that this is the response event
			//if (this.readyState === 4) {
			if (event.currentTarget.readyState === 4) {
				var parsedResponse = JSON.parse(event.currentTarget.responseText);
				//In case of an error, an error popup is shown
				if (parsedResponse.hasOwnProperty('error')) {
					var errorMessage = parsedResponse.error.message;
					sap.m.MessageBox.show(errorMessage);
					// Check whether the response contains the expected element
				} else if (parsedResponse.hasOwnProperty('units')) {
					//Store the translated text
					var translatedText = parsedResponse.units[0].translations[0].value;
					//Display the text on the UI
					sap.m.MessageToast.show(translatedText);
					//update the view information with the translated project name
					sap.ui.getCore().byId("__xmlview0--ProjectName_id").setProperty("value", translatedText);
					
					/********* 
					 * 4. API CALL: Call the google maps location API to get all details of the entered project location
					 **********/
					//Create a new HTTP request
					var httpRequest = new XMLHttpRequest();
					//add an event listener so that we can react on the result of the location service
					httpRequest.addEventListener("readystatechange", this._eventListenerLocation);
					//get the project location, for which the address shall be retriebed
					var projDescr = sap.ui.getCore().byId("__xmlview0--LocationName_id").getProperty("value");
				    //The following relative path '/googlemaps' is mapped in the destinations area of the cloud platfom to absolute path 
				    //'https://maps.googleapis.com/maps/api/'. In the neo-app.json file the link between the app and the cloud platform destination is maintained.
					var url = "/googlemaps/place/findplacefromtext/json?input=" + projDescr + "&inputtype=textquery&fields=formatted_address,name,geometry&key=AIzaSyC3C0B0CBXeYtnyW3VZL2O9R48yphR3S1c";
					httpRequest.open("GET", url );
					httpRequest.send();

				}
			}
		},
		_eventListenerLocation: function () {
			//We have to check for the readyState 4, meanining that this is the response event
			if (this.readyState === 4) {
				var locationDetails;
				var parsedResponse = JSON.parse(event.currentTarget.responseText);
				//In case of an error, an error popup is shown
				if (parsedResponse.status === "INVALID_REQUEST") {
					var errorMessage = parsedResponse.error.message;
					sap.m.MessageBox.show(errorMessage);
					// Check whether the response contains the expected element
				} else if (parsedResponse.hasOwnProperty('candidates')) {
						var projDescr = sap.ui.getCore().byId("__xmlview0--LocationName_id").getProperty("value");
						locationDetails = projDescr + ", " + parsedResponse.candidates[0].formatted_address;
				}
			
					/********* 
					 * 5. API CALL: Finally call the S/4HANA Cloud OData-service to create the project
					 **********/
					//For the final API call to create the project we want to make us of an OData model as the backend call is OData based
					var oModelNew = new sap.ui.model.odata.ODataModel("/S4HC/sap/opu/odata/cpd/SC_PROJ_ENGMT_CREATE_UPD_SRV/", true);

					//For the date fields we have to do an additional transformation into the ISO format and shorten it
					var dateFrom = sap.ui.getCore().byId("__xmlview0--StartDate_id").getProperty("value");
					var dateFromISO = new Date(dateFrom).toISOString();
					var dateFromShort = dateFromISO.split(".")[0];
					var dateTo = sap.ui.getCore().byId("__xmlview0--EndDate_id").getProperty("value");
					var dateToISO = new Date(dateTo).toISOString();
					var dateToShort = dateToISO.split(".")[0];

					//Now the full payload is prepared. Each field content is retrieved by the UI element
					var jsonBody = {
						"ProjectCategory": sap.ui.getCore().byId("__xmlview0--ProjectCategory_id").getProperty("value"),
						"OrgID": sap.ui.getCore().byId("__xmlview0--OrgID_id").getProperty("value"),
						"CostCenter": sap.ui.getCore().byId("__xmlview0--CostCenter_id").getProperty("value"),
						"ProfitCenter": sap.ui.getCore().byId("__xmlview0--ProfitCenter_id").getProperty("value"),
						"Customer": sap.ui.getCore().byId("__xmlview0--Customer_id").getProperty("value"),
						"Currency": sap.ui.getCore().byId("__xmlview0--Currency_id").getProperty("value"),
						"ProjectID": sap.ui.getCore().byId("__xmlview0--ProjectID_id").getProperty("value"),
						//The project name is now translated
						"ProjectName": sap.ui.getCore().byId("__xmlview0--ProjectName_id").getProperty("value"),
						"ProjectStage": sap.ui.getCore().byId("__xmlview0--ProjectStage_id").getProperty("value"),
						"ProjManagerExtId": sap.ui.getCore().byId("__xmlview0--ProjManagerExtId_id").getProperty("value"),
						"StartDate": dateFromShort, //transformed from date
						"EndDate": dateToShort, //transformed to date
						"YY1_Projectlocation_Cpr": locationDetails
					};

					//Now we finally fire the OData-based HTTP POST request.
					oModelNew.create("/ProjectSet", jsonBody, {
						success: function (oCreatedEntry) {
							sap.m.MessageToast.show("Creation successful, ID" + oCreatedEntry.ProjectID);

							//initialize some master data
							var oMasterModel = sap.ui.getCore().byId("application-CreateProjects-display-component---master").getModel();
							var oAppViewModel = sap.ui.getCore().byId("application-CreateProjects-display-component---master").getModel("appView");
							var oMasterController = sap.ui.getCore().byId("application-CreateProjects-display-component---master").getController();
							//gcreate a new project key for the model and store the path
							var sObjectPath = oMasterModel.createKey("ProjectSet", oCreatedEntry);
							//update the application view model with the new project path so that we can automatically open it after the creation
							oAppViewModel.setProperty("/itemToSelect", "/" + sObjectPath);
							oAppViewModel.setProperty("/busy", false);
							//refresh the master list (important. Otherwise, we can not set the focus to the new project)
							oMasterController.onRefresh();
							//Finally we open the new object to show it on the UI
							oMasterController.getRouter().navTo("object", {
								ProjectID: oCreatedEntry.ProjectID
							}, true);

						},
						error: function (oError) {
							//In case of error, an error message box is shown
							sap.m.MessageBox.show(JSON.parse(oError.response.body).error.message.value);
						}
					});
			}
		}
	});
});