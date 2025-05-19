
        window.addEventListener("load", initialize);

        //Initializing Functions

        function initialize() {

          //  document.getElementById("txtgFullName").style.display = "none";       //hide property

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
            btnClear.addEventListener("click",btnClearMC);
            btnUpdate.addEventListener("click",btnUpdateMC);

            //search people
            txtSearchName.addEventListener("keyup",btnSearchMC);

            cmbgRelationship.addEventListener("change",btnRelationshipMC);  //relationship enable

          //  chekOSA.addEventListener("change",btnOSAMC);           //OSA number enable

            privilages = httpRequest("../privilage?module=GUARDIAN","GET");

            //drop down ena than walata data genna gananna
            genders = httpRequest("../gender/list","GET");
            reletionships = httpRequest("../relationship/list","GET");
            guardianstatusts = httpRequest("../guardianstatus/list","GET");
            employees = httpRequest("../employee/list","GET");

            valid = "2px solid green";
            invalid = "2px solid red";
            initial = "2px solid #461220";
            updated = "2px solid #ffcf56";
            active = "#538d22";


            loadView();     //load view side
           loadForm();      //refresh form

            changeTab('form');
        }

        function loadView() {
            //Search Area
            txtSearchName.value="";
            txtSearchName.style.background = "";

            //Table Area
            activerowno = "";
            activepage = 1;
            var query = "&searchtext=";
            loadTable(1,cmbPageSize.value,query);
        }

        //fill data into table
        function loadTable(page,size,query) {
            page = page - 1;
            guardians = new Array();
          var data = httpRequest("/guardian/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) guardians = data.content;             //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);
            //paginate = page ekak click kalama weda karanne

            fillTable('tblGuardian',guardians,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblGuardian);

            if(activerowno!="")selectRow(tblGuardian,activerowno,active);

        }

        //paginate
        function paginate(page) {
            var paginate;
            if(oldguardian==null){
                paginate=true;
            }else{
                if(getErrors()==''&&getUpdates()==''){
                    paginate=true;
                }else{
                    paginate = window.confirm("Form has Some Errors or Update Values." +
                        "Are you sure to discard that changes ?");
                }
            }
            if(paginate) {
                activepage=page;
                activerowno=""
                loadForm();
                loadSearchedTable();
            }

        }

        //print
        function viewitem(grdian,rowno) {

            guardian = JSON.parse(JSON.stringify(grdian));

            tdgFullName.innerHTML = guardian.fullname;
            tdtgInitialName.innerHTML = guardian.initialname;
            tdgNIC.innerHTML = guardian.nic;
            tdgGender.innerHTML = guardian.gender_id.name;
            tdgDOB.innerHTML = guardian.dob;
            tdgMobile.innerHTML = guardian.mobileno;
            tdgLandPhone.innerHTML = guardian.landno;

            tdgOSA.innerHTML = guardian.oldmember;
            tdgOSANumber.innerHTML = guardian.osanumber;

            tdgAddress.innerHTML = guardian.address;
            tdgDescription.innerHTML = guardian.description;
            tdgRelationshipInfo.innerHTML = guardian.aboutrelationship;

            tdposition.innerHTML = guardian.position;
            tdworkplacename.innerHTML = guardian.workplacename;
            tdworkaddress.innerHTML = guardian.workaddress;
            tdworkphone.innerHTML = guardian.workphone;

            tdgRelationship.innerHTML = guardian.relationship_id.name;
            tdg2Name.innerHTML = guardian.othergname;
            tdg2NIC.innerHTML = guardian.othergnic;
            tdg2Mobile.innerHTML = guardian.othergphone;
            tdg2Relationship.innerHTML = guardian.othergrelationshiptype;
            tdAsignDate.innerHTML = guardian.asigndate;
            tdGuardianstatus.innerHTML = guardian.guardianstatus_id.name;

            $('#guardianVieweModal').modal('show'); //show model

         }

         //row print
         function btnPrintRowMC(){
             var format = printformtable.outerHTML;

             var newwindow=window.open();
             newwindow.document.write("<html>" +
                 "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}</style></head>" +
                 "<link rel='stylesheet' href='resources/bootstrap/css/bootstrap.min.css'>" +
                 "<body><div style='margin-top: 100px text-align: center; font-size:10px;' class='text-center'><h1>Guardian Details </h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             setTimeout(function () {newwindow.print(); },100);
         }

        function loadForm() {
            guardian = new Object();
            oldguardian = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //fill data in to combo box
            fillCombo(cmbgGender,"Select Gender",genders,"name","");
            fillCombo(cmbgRelationship,"Select Relationshp Type",reletionships,"name","");

            //fill and auto select , auto bind
            fillCombo(cmbGuardianstatus,"",guardianstatusts,"name","Active");
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);

            //convert to string
            guardian.guardianstatus_id=JSON.parse(cmbGuardianstatus.value);
            cmbGuardianstatus.disabled = true;

            guardian.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

             var today = new Date();            //create date object
             var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
             if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
             var date = today.getDate();        // 1 to 31 range
             if(date<10) date = "0"+date;

            dteAsignDate.value=today.getFullYear()+"-"+month+"-"+date;
            guardian.asigndate=dteAsignDate.value;
            dteAsignDate.disabled = true;

            //form eka load wenakota disable
            txtgRelationshipInfo.disabled = true;
            txtOSANumber.disabled = true;

            //load wenakota text field empty
            txtgFullName.value = "";
            txtgNameInitial.value = "";
            txtgNIC.value = "";
            txtgRelationshipInfo.value = "";
            txtgMobile.value = "";
            txtgLandPhone.value = "";
            txtOSANumber.value = "";
            txtgAddress.value = "";
            txtgDescription.value = "";

            txtgPosition.value = "";
            txtgWorkplaceName.value = "";
            txtgWorkplaceAddress.value = "";
            txtgWorkplacePhone.value = "";

            txtg2Name.value = "";
            txtg2NIC.value = "";
            txtg2Mobile.value = "";
            txtg2Relationship.value = "";

            //auto load disable ewata valid color enawa
            setStyle(initial);
            dteAsignDate.style.border=valid;
            cmbGuardianstatus.style.border=valid;
            cmbAddedBy.style.border=valid;

             disableButtons(false, true, true);
        }

        function setStyle(style) {

            txtgFullName.style.border = style;
            txtgNameInitial.style.border = style;
            txtgNIC.style.border = style;
            cmbgGender.style.border = style;
            dtegDOB.style.border = style;
            cmbgRelationship.style.border = style;
            txtgRelationshipInfo.style.border = style;
            txtgMobile.style.border = style;
            txtgLandPhone.style.border = style;
            txtOSANumber.style.border = style;
            txtgAddress.style.border = style;
            txtgDescription.style.border = style;

            txtgPosition.style.border = style;
            txtgWorkplaceName.style.border = style;
            txtgWorkplaceAddress.style.border = style;
            txtgWorkplacePhone.style.border = style;

            txtg2Name.style.border = style;
            txtg2NIC.style.border = style;
            txtg2Mobile.style.border = style;
            txtg2Relationship.style.border = style;

            dteAsignDate.style.border = style;
            cmbGuardianstatus.style.border = style;
            cmbAddedBy.style.border = style;

        }

        function disableButtons(add, upd, del) {

            if (add || !privilages.add) {
                btnAdd.setAttribute("disabled", "disabled");
                $('#btnAdd').css('cursor','not-allowed');
            }
            else {
                btnAdd.removeAttribute("disabled");
                $('#btnAdd').css('cursor','pointer')
            }

            if (upd || !privilages.update) {
                btnUpdate.setAttribute("disabled", "disabled");
                $('#btnUpdate').css('cursor','not-allowed');
            }
            else {
                btnUpdate.removeAttribute("disabled");
                $('#btnUpdate').css('cursor','pointer');
             }

            if (!privilages.update) {
                $(".buttonup").prop('disabled', true);
                $(".buttonup").css('cursor','not-allowed');
            }
            else {
                $(".buttonup").removeAttr("disabled");
                $(".buttonup").css('cursor','pointer');
            }

            if (!privilages.delete){
                $(".buttondel").prop('disabled', true);
                $(".buttondel").css('cursor','not-allowed');
            }
            else {
                $(".buttondel").removeAttr("disabled");
                $(".buttondel").css('cursor','pointer');
            }

            // select deleted data row
            for(index in guardians){
                if(guardians[index].guardianstatus_id.name =="Deleted"){
                    tblGuardian.children[1].children[index].style.color = "#f00";
                    tblGuardian.children[1].children[index].style.border = "2px solid red";
                    tblGuardian.children[1].children[index].lastChild.children[1].disabled = true;
                    tblGuardian.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";

                }
            }

        }

        function nicTestFieldBinder(field,pattern,ob,prop,oldob) {
           // console.log(cmbgGender.required)
            var regpattern = new RegExp(pattern);

            var val = field.value.trim();
            if (regpattern.test(val)) {
                var responce = httpRequest("/guardian/byguardiannic?nic="+val,"GET");

                var dobyear, gendername,noOfDays = "";
                if (val.length===10){
                    dobyear = "19"+val.substring(0,2);
                    noOfDays = val.substring(2,5);
                }else{
                    dobyear = val.substring(0,4);
                    noOfDays = val.substring(4,7);
                }
                birthdate = new Date(dobyear+"-"+"01-01");
                if (noOfDays>=1 && noOfDays<=366){
                    gendername =  "Male";
                }else if(noOfDays>=501 && noOfDays<=866){
                    noOfDays = noOfDays-500;
                    gendername =  "Female";
                }


//new start
                if(responce==""){
                    if(gendername=== "Female" ||  gendername ===  "Male"){
                        fillCombo(cmbgGender,"Select Gender",genders,"name",gendername);
                        birthdate.setDate(birthdate.getDate()+parseInt(noOfDays)-1)
                        dtegDOB.value = birthdate.getFullYear()+"-"+getmonthdate(birthdate);

                        guardian.gender_id = JSON.parse(cmbgGender.value);
                        guardian.dob = dtegDOB.value;
                        guardian.nic = field.value;
                        if (oldguardian != null && oldguardian.nic != guardian.nic){
                            field.style.border=updated;}else {field.style.border=valid;}
                        if (oldguardian != null && oldguardian.dob != guardian.dob){
                            dtegDOB.style.border=updated;}else {dtegDOB.style.border=valid;}
                        if (oldguardian != null && oldguardian.gender_id.name != guardian.gender_id.name){
                            cmbGender.style.border=updated;}else {cmbgGender.style.border=valid;}
                        dteDOBirthCH();
                    }else{

                    }

                }else {
                    swal({
                        title: "NIC is Alredy Exist!",
                        text: "\n\n",
                        icon: "warning", button: false,
                        timer: 1500,
                    });

                    field.style.border = invalid;
                    cmbgGender.style.border = initial;
                    dtegDOB.style.border = initial;
                    fillCombo(cmbgGender,"Select Gender",genders,"name","");
                    dtegDOB.value = "";
                    guardian.nic = null;
                }
//new end

            }else{
                field.style.border = invalid;
                guardian.nic = null;
            }
        }

        //*************
        function nicFieldBinder(field,pattern,ob,prop,oldob) {
            var regpattern = new RegExp(pattern);
    
            var val = field.value.trim();
            if (regpattern.test(val)) {
                employee.nic = val;
                if (oldemployee != null && oldemployee.nic != employee.nic){
                    field.style.border = updated;
                    gender = generate(val,field,cmbGender,dteDOBirth);
                   fillCombo(cmbGender,"Select Gender",genders,"name",gender);
                   cmbGender.style.border=updated;
                    dteDOBirth.style.border=updated;
                    employee.genderId = JSON.parse(cmbGender.value);
                    employee.dobirth = dteDOBirth.value;
                }else{
                    field.style.border = valid;
                    gender =  generate(val,field,cmbGender,dteDOBirth);
                    fillCombo(cmbGender,"Select Gender",genders,"name",gender);
                    cmbGender.style.border=valid;
                    dteDOBirth.style.border=valid;
                    employee.genderId = JSON.parse(cmbGender.value);
                    employee.dobirth = dteDOBirth.value;
                }
            }
            else {
                field.style.border = invalid;
                employee.nic = null;
            }
        }

        function dteDOBirthCH() {
            var today = new Date();
            var birthday = new Date(dtegDOB.value);
            if((today.getTime()-birthday.getTime())>(18*365*24*3600*1000)) {
                guardian.dob = dtegDOB.value;
                dtegDOB.style.border = valid;
            }
            else
            {
                guardian.dob = null;
                dtegDOB.style.border = invalid;
            }
        }

        function getErrors() {

            var errors = "";
            addvalue = "";

            if (guardian.fullname == null)
                errors = errors + "\n" + "Full Name is Not Entered";
            else  addvalue = 1;

            if (guardian.initialname == null)
                errors = errors + "\n" + "Name with Initials is Not Entered";
            else  addvalue = 1;

            if (guardian.nic == null)
                errors = errors + "\n" + "NIC is Not Entered";
            else  addvalue = 1;

           /* if (guardian.relationship_id == null)
                errors = errors + "\n" + "Relationship Type is Not Entered";
            else {
                if (JSON.parse(cmbgRelationship.value).name == "Other Guardian"){
                    if (guardian.txtgRelationshipInfo == null)
                        errors = errors + "\n" + "About Relationship is Not Entered";
                    else  addvalue = 1;
                }
            }*/


            if (guardian.relationship_id == null)
                errors = errors + "\n" + "Relationship Type is Not Entered";
            else addvalue = 1;


            if (guardian.mobileno == null)
                errors = errors + "\n" + "Mobile Number is Not Entered";
            else  addvalue = 1;

           /* if (guardian.oldmember == null)
                errors = errors + "\n" + "OSA Membership is Not Entered";
            else  addvalue = 1;*/

            if (guardian.oldmember == true){
                if (guardian.osanumber == null)
                    errors = errors + "\n" + "OSA Number is Not Entered";
                else  addvalue = 1;
            }


            if (guardian.address == null)
                errors = errors + "\n" + "Address is Not Entered";
            else  addvalue = 1;

            return errors;

        }

        function btnAddMC(){
            if(getErrors()==""){
                if(txtgLandPhone.value == "" || txtgDescription.value == "" || txtgPosition.value == "" || txtgWorkplaceName.value == "" ||
                    txtgWorkplaceAddress.value == "" || txtgWorkplacePhone.value == "" || txtgRelationshipInfo.value == "" ||
                    txtg2Name.value == "" || txtg2NIC.value == "" || txtg2Mobile.value == "" || txtg2Relationship.value == "" ){
                    swal({
                        title: "Are you sure to continue?",
                        text: "Form has some empty fields",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    }).then((willDelete) => {
                        if (willDelete) {
                            savedata();
                        }
                    });

                }else{
                    savedata();
                }
            }else{
                swal({
                    title: "You have following errors",
                    text: "\n"+getErrors(),
                    icon: "error",
                    button: true,
                });

            }
        }
        
        function savedata() {

            var oldmemner = "";
            if(guardian.oldmember) oldmemner = "Old Member"; else oldmemner = " Not an Old Member";

            swal({
                title: "Are you sure to add following guardian...?" ,
                text :
                    "\n Full Name : " + guardian.fullname +
                    "\n Name with Initials : " + guardian.initialname +
                    "\nNIC : " + guardian.nic +
                    "\nBirth Date : " + guardian.dob +
                    "\nGender : " + guardian.gender_id.name +
                    "\nrelationship  : " + guardian.relationship_id.name +
                    "\nMobile : " + guardian.mobileno +
                    "\nOSA membership : " + oldmemner  +
                    "\nAddress : " + guardian.address +
                    "\nguardian Status : " + guardian.guardianstatus_id.name,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/guardian", "POST", guardian);
                    if (response == "0") {
                        swal({
                            position: 'center',
                            icon: 'success',
                            title: 'Your work has been Done \n Save SuccessFully..!',
                            text: '\n',
                            button: false,
                            timer: 1200
                        });
                        activepage = 1;
                        activerowno = 1;        // add une palaweni row eka
                        loadSearchedTable();
                        loadForm();
                        changeTab('table');
                    }
                    else swal({
                        title: 'Save not Success... , You have following errors', icon: "error",
                        text: '\n ' + response,
                        button: true
                    });
                }
            });

        }

        function btnClearMC() {
            //Get Cofirmation from the User window.confirm();
            checkerr = getErrors();

            if(oldguardian == null && addvalue == ""){
                loadForm();
            }else{
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        loadForm();
                    }
                });
            }

        }

        function fillForm(grdian,rowno){
            activerowno = rowno;
            if (oldguardian==null) {        //edit karanna kalin object eka
                filldata(grdian);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(grdian);
                    }

                });
            }

        }

        //when updating refill data into form
        function filldata(grdian) {
            clearSelection(tblGuardian);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblGuardian,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            guardian = JSON.parse(JSON.stringify(grdian));
            oldguardian = JSON.parse(JSON.stringify(grdian));

            txtgFullName.value = guardian.fullname;
            txtgNameInitial.value = guardian.initialname;
            txtgNIC.value = guardian.nic;
            dtegDOB.value = guardian.dob;
            txtgMobile.value = guardian.mobileno;
            txtgLandPhone.value = guardian.landno;
            txtgRelationshipInfo.value = guardian.aboutrelationship;

            if(guardian.oldmember == true) {
                chekOSA.value = true;
                $('#chekOSA').bootstrapToggle('on');
            }else   {
                $('#chekOSA').bootstrapToggle('off');
                chekOSA.value = false;
            }

            chekOSA.value = guardian.oldmember;
            txtOSANumber.value = guardian.osanumber;
            txtgAddress.value = guardian.address;
            txtgDescription.value = guardian.description;
            txtgRelationshipInfo.value = guardian.aboutrelationship;

            txtgPosition.value = guardian.position;
            txtgWorkplaceName.value = guardian.workplacename;
            txtgWorkplaceAddress.value = guardian.workaddress;
            txtgWorkplacePhone.value = guardian.workphone;

            txtg2Name.value = guardian.othergname;
            txtg2NIC.value = guardian.othergnic;
            txtg2Mobile.value = guardian.othergphone;
            txtg2Relationship.value = guardian.othergrelationtype;
            dteAsignDate.value = guardian.asigndate;

            if (guardian.description != null)  txtgDescription.value = guardian.description; else  txtgDescription.value="";
            if (guardian.othergrelationtype != null)  txtg2Relationship.value = guardian.othergrelationtype; else  txtg2Relationship.value="";


            //fill combo predefine functtion ekak
            //fill data in to combo box
            fillCombo(cmbgGender,"Select Gender",genders,"name",guardian.gender_id.name);
            fillCombo(cmbgRelationship,"Select Relationshp Type",reletionships,"name",guardian.relationship_id.name);

            //fill and auto select , auto bind
            fillCombo(cmbGuardianstatus,"",guardianstatusts,"name",guardian.guardianstatus_id.name);
            cmbGuardianstatus.disabled = false;             //update ekedith disable
            fillCombo(cmbAddedBy,"",employees,"callingname",guardian.employee_id.callingname);


            disableButtons(true, false, false);
            setStyle(valid);
            changeTab('form');

            //optional fields walata color eka set karanawa
            if(guardian.aboutrelationship == null) txtgRelationshipInfo.style.border = initial;
            if(guardian.landno == null) txtgLandPhone.style.border = initial;
            if(guardian.osanumber == null) txtOSANumber.style.border = initial;
            if(guardian.description == null) txtgDescription.style.border = initial;

            if(guardian.position == null) txtgPosition.style.border = initial;
            if(guardian.workplacename == null) txtgWorkplaceName.style.border = initial;
            if(guardian.workaddress == null) txtgWorkplaceAddress.style.border = initial;
            if(guardian.workphone == null) txtgWorkplacePhone.style.border = initial;

            if(guardian.othergname == null) txtg2Name.style.border = initial;
            if(guardian.othergnic == null) txtg2NIC.style.border = initial;
            if(guardian.othergphone == null) txtg2Mobile.style.border = initial;
            if(guardian.othergrelationtype == null) txtg2Relationship.style.border = initial;

        }

        //chande una ewa catch karanwa
        function getUpdates() {

            var updates = "";

            if(guardian!=null && oldguardian!=null) {

                if (guardian.fullname != oldguardian.fullname)
                    updates = updates + "\nFull Name is Changed " + oldguardian.fullname + " into " + guardian.fullname;

                if (guardian.initialname != oldguardian.initialname)
                    updates = updates + "\nName with Initials is Changed " + oldguardian.initialname + " into " + guardian.initialname;

                if (guardian.nic != oldguardian.nic)
                    updates = updates + "\nNIC is Changed " + oldguardian.nic + " into " + guardian.nic;

                if (guardian.relationship_id.name != oldguardian.relationship_id.name)
                    updates = updates + "\nRelationship type is Changed " + oldguardian.relationship_id.name + " into " + guardian.relationship_id.name;

                if (guardian.aboutrelationship != oldguardian.aboutrelationship)
                    updates = updates + "\nAbout Relationship is Changed " + oldguardian.aboutrelationship + " into " + guardian.aboutrelationship;

                if (guardian.mobileno != oldguardian.mobileno)
                    updates = updates + "\nMobile Number is Changed " + oldguardian.mobileno + " into " + guardian.mobileno;

                if (guardian.landno != oldguardian.landno)
                    updates = updates + "\nLand Phone Number is Changed " + oldguardian.landno + " into " + guardian.landno;

                if (guardian.oldmember != oldguardian.oldmember)
                    updates = updates + "\nOSA Membership is Changed ";

                if (guardian.osanumber != oldguardian.osanumber)
                    updates = updates + "\nOSA Number is Changed " + oldguardian.osanumber + " into " + oldguardian.osanumber;

                if (guardian.address != oldguardian.address)
                    updates = updates + "\nAddress is Changed " + oldguardian.address + " into " + oldguardian.address;

                //occupation
                if (guardian.position != oldguardian.position)
                    updates = updates + "\nPosition is Changed " + oldguardian.position + " into " + oldguardian.occupation;

                if (guardian.workplacename != oldguardian.workplacename)
                    updates = updates + "\nWork Place Name is Changed " + oldguardian.workplacename + " into " + oldguardian.workplacename;

                if (guardian.workaddress != oldguardian.workaddress)
                    updates = updates + "\nWork Place Address is Changed " + oldguardian.workaddress + " into " + oldguardian.workaddress;

                if (guardian.workphone != oldguardian.workphone)
                    updates = updates + "\nWork Place Contact Number is Changed " + oldguardian.workphone + " into " + oldguardian.workphone;

                // other guardian
                if (guardian.othergname != oldguardian.othergname)
                    updates = updates + "\nOther guardian's Name is Changed " + oldguardian.othergname + " into " + guardian.othergname;

                if (guardian.othergnic != oldguardian.othergnic)
                    updates = updates + "\nOther guardian's NIC is Changed " + oldguardian.othergnic + " into " + guardian.othergnic;

                if (guardian.othergphone != oldguardian.othergphone)
                    updates = updates + "\nOther guardian's Phone number is Changed " + oldguardian.othergphone + " into " + guardian.othergphone;

                if (guardian.othergrelationtype != oldguardian.othergrelationtype)
                    updates = updates + "\nOther guardian's Relationship details is Changed " + oldguardian.othergrelationtype + " into " + guardian.othergrelationtype;


                if (guardian.description != oldguardian.description)
                    updates = updates + "\nDescription is Changed " + oldguardian.description + " into " + guardian.description;

                if (guardian.guardianstatus_id.name != oldguardian.guardianstatus_id.name)
                    updates = updates + "\nGuardianstatus is Changed " + oldguardian.guardianstatus_id.name + " into " + guardian.guardianstatus_id.name;

            }

            return updates;

        }

        function btnUpdateMC() {
            var errors = getErrors();       // update check karanna kalin errors check karanna oni nisa
            if (errors == "") {
                var updates = getUpdates();
                if (updates == "")
                    swal({
                    title: 'Nothing Updated..!',icon: "warning",
                    text: '\n',
                    button: false,
                    timer: 1200});
                else {
                    swal({
                        title: "Are you sure to update following duardian details?",
                        text: "\n"+ getUpdates(),
                        icon: "warning", buttons: true, dangerMode: true,
                    })
                        .then((willDelete) => {
                        if (willDelete) {
                            var response = httpRequest("/guardian", "PUT", guardian);
                            if (response == "0") {
                                swal({
                                    position: 'center',
                                    icon: 'success',
                                    title: 'Your work has been Done \n Update SuccessFully..!',
                                    text: '\n',
                                    button: false,
                                    timer: 1200
                                });
                                loadSearchedTable();
                                loadForm();
                                changeTab('table');

                            }
                            else
                                swal({
                                    title: 'Failed to Update!',icon: "error",
                                    text: 'You have following errors..\n '+response,
                                    button: true});
                        }
                        });
                }
            }
            else
                swal({
                    title: 'You have following errors in your form',icon: "error",
                    text: '\n '+getErrors(),
                    button: true});

        }

        function btnDeleteMC(grdian) {
            guardian = JSON.parse(JSON.stringify(grdian));     //json string ekak karala object ekakta convert karanwa

            swal({
                title: "Are you sure to delete following guardian?",
                text:
                    "\n Guardian's Full Name : " + guardian.fullname +
                    "\n Guardian's NIC : " + guardian.nic,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete)=> {
                if (willDelete) {
                    var responce = httpRequest("/guardian","DELETE",guardian);
                    if (responce==0) {
                        swal({
                            title: "Deleted Successfully....!",
                            text: "\n\n  Status change to delete",
                            icon: "success", button: false, timer: 1200,
                        });
                        loadSearchedTable();
                        loadForm();
                    } else {
                        swal({
                            title: "You have following erros....!",
                            text: "\n\n" + responce,
                            icon: "error", button: true,
                        });
                    }
                }
            });

       }

        function loadSearchedTable() {
            var searchtext = txtSearchName.value;
            var query ="&searchtext=";

            if(searchtext!="")
                query = "&searchtext=" + searchtext;
            //window.alert(query);

            loadTable(activepage, cmbPageSize.value, query);        // for load table

            //disable delete button when searching
            disableButtons(false, true, true);

        }

        function btnSearchMC(){
            activepage=1;
            loadSearchedTable();
        }

        function btnSearchClearMC(){
               loadView();
        }


       function btnPrintTableMC() {

           var newwindow=window.open();
           formattab = tblGuardian.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 150px; '> <h1> Guardian Details </h1></div>" +
               "<div>"+ formattab+"</div>"+
               "</body>" +
               "</html>");
           setTimeout(function () {newwindow.print();
              // newwindow.close();
               },100) ;
        }

        //*************
        function sortTable(cind) {
            cindex = cind;

         var cprop = tblEmployee.firstChild.firstChild.children[cindex].getAttribute('property');

           if(cprop.indexOf('.') == -1) {
               employees.sort(
                   function (a, b) {
                       if (a[cprop] < b[cprop]) {
                           return -1;
                       } else if (a[cprop] > b[cprop]) {
                           return 1;
                       } else {
                           return 0;
                       }
                   }
               );
           }else {
               employees.sort(
                   function (a, b) {
                       if (a[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)] < b[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)]) {
                           return -1;
                       } else if (a[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)] > b[cprop.substring(0,cprop.indexOf('.'))][cprop.substr(cprop.indexOf('.')+1)]) {
                           return 1;
                       } else {
                           return 0;
                       }
                   }
               );
           }
            fillTable('tblEmployee',employees,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblEmployee);
            loadForm();

            if(activerowno!="")selectRow(tblEmployee,activerowno,active);



        }

        function CheckBoxOSA(){
            console.log(chekOSA.checked);
            if(chekOSA.checked){
                guardian.oldmember  = true;
                txtOSANumber.disabled = false;
            }else {
                guardian.oldmember  = false;
                txtOSANumber.disabled = true;
            }
        }

        function btnRelationshipMC(){
            if(guardian.relationship_id.name == "Other Guardian"){
                txtgRelationshipInfo.disabled = false;
            }else {
                txtgRelationshipInfo.disabled = true;
            }
        }

     /*   function btnOSAMC(){
            if (guardian.oldmember == true){
                txtOSANumber.disabled = false;
            }else {
                txtOSANumber.disabled = true;
            }

        }*/