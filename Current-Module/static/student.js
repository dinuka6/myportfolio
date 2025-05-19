
        window.addEventListener("load", initialize);

        //Initializing Functions -finish

        function initialize() {

            $('[data-toggle="tooltip"]').tooltip();     //tool tip unable

            $('.js-example-basic-single').select2();       //type and search

            btnAdd.addEventListener("click",btnAddMC);      //button walata event handler bind karala
            btnClear.addEventListener("click",btnClearMC);
            btnUpdate.addEventListener("click",btnUpdateMC);

            txtSearchName.addEventListener("keyup",btnSearchMC);

            //change dob range according to added garde
            cmbGrade.addEventListener("change",cmbDOBCH);

            //when 'grade = 2,3,4,5' enable school leaving setificate
            cmbGrade.addEventListener("change",docSchLeavingCH);

            privilages = httpRequest("../privilage?module=STUDENT","GET");

            //drop down ena than walata data genna gananna
            genders = httpRequest("../gender/list","GET");
            religions = httpRequest("../religion/list","GET");
            gramaniladaridevisions = httpRequest("../gramaniladaridevision/list","GET");
            grades = httpRequest("../grade/list","GET");
            studentstatusts = httpRequest("../studentstatus/list","GET");
            employees = httpRequest("../employee/list","GET");

            guardians = httpRequest("../guardian/list","GET");

            valid = "2px solid green";
            invalid = "2px solid red";
            initial = "2px solid #38040EFF";
            updated = "2px solid #ffcf56";
            active = "#538d22";

            //load view side
            loadView();

            //refresh form
           loadForm();


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
            students = new Array();
          var data = httpRequest("/student/findAll?page="+page+"&size="+size+query,"GET");
            if(data.content!= undefined) students = data.content;                   //data thiyanawada balala data load karanwa
            createPagination('pagination',data.totalPages, data.number+1,paginate);

            fillTable('tblStudent',students,fillForm,btnDeleteMC,viewitem);
            clearSelection(tblStudent);

            if(activerowno!="")selectRow(tblStudent,activerowno,active);

        }

        //******************
        function paginate(page) {
            var paginate;
            if(oldstudent==null){
                paginate=true;
            }else{
                if(getErrors()==''&&getUpdates()==''){
                    paginate=true;
                }else{
                    paginate = window.confirm("Form has Some Errors or Update Values. " +
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
        function viewitem(stu,rowno) {

            student = JSON.parse(JSON.stringify(stu));

            tdtxtsRegNo.innerHTML = student.regno;
            tdtxtsCName.innerHTML = student.cname;
            tdInitialname.innerHTML = student.initialname;
            tdtxtsFullName.innerHTML = student.fullname;
            tddtesDOB.innerHTML = student.dob;

            tdBirthsetificate.innerHTML = student.docbirthsetificate;
            tdDocgrama.innerHTML = student.docgrama;
            tdSchoolleaving.innerHTML = student.docschoolleaving;

            tddtesDOB.innerHTML = student.dob;
            tdtxtPhone.innerHTML = student.phone;
            txtEmergencyPhone.innerHTML = student.emergencynumber;

            tdtxtPreSchool.innerHTML = student.preschoolname;
            tdtxtAddress.innerHTML = student.address;
            tdtxtHealth.innerHTML = student.healthcondition;
            tdtxtsDescription.innerHTML = student.description;
            tddteAsignDate.innerHTML = student.asigndate;
            tdcmbsGender.innerHTML = student.gender_id.name;
            tdcmbsReligion.innerHTML = student.religion_id.name;
            //tdcmbGuardian.innerHTML = student.guardian_id.name;
            tdcmbGramaniladari.innerHTML = student.gramaniladaridevision_id.name;
            tdcmbGrade.innerHTML = student.grade_id.name;
            tdcmbStudentstatus.innerHTML = student.studentstatus_id.name;

            $('#studentVieweModal').modal('show'); //show model

         }

         //row print
         function btnPrintRowMC(){
             var format = printformtable.outerHTML;

             var newwindow=window.open();
             newwindow.document.write("<html>" +
                 "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}</style></head>" +
                 "<link rel='stylesheet' href='resources/bootstrap/css/bootstrap.min.css'>" +
                 "<body><div style='margin-top: 150px'><h1>Student Details :</h1></div>" +
                 "<div>"+format+"</div>" +
                 "<script>printformtable.removeAttribute('style')</script>" +
                 "</body></html>");
             setTimeout(function () {newwindow.print(); newwindow.close();},100);
         }

         function cmbGuardianCH(){
             txtPhone.value = JSON.parse(cmbGuardian.value).mobileno;
             txtPhone.style.border = valid;
             student.phone = txtPhone.value;

             txtAddress.value=JSON.parse(cmbGuardian.value).address;
             txtAddress.style.border = valid;
             student.address = txtAddress.value; // object property ekata bind kirima

            /* txtEmergencyPhone.value=JSON.parse(cmbGuardian.value).mobileno;
             txtEmergencyPhone.style.border = valid;
             student.emergencynumber = txtEmergencyPhone.value;*/
         }

        function loadForm() {
            student = new Object();
            oldstudent = null;     //form eka load wenakota old object ekak nathi nisa old object = null

            //fill data in to combo box
            fillCombo(cmbsGender,"Select Gender",genders,"name","");
            fillCombo(cmbsReligion,"Select Religion",religions,"name","");
            fillCombo(cmbGramaniladari,"Select Devision",gramaniladaridevisions,"name","");
            fillCombo(cmbGrade,"Select Grade",grades,"name","");

            //fill and auto select , auto bind
            fillCombo(cmbStudentstatus,"",studentstatusts,"name","Active");
            fillCombo(cmbAddedBy,"",employees,"callingname",session.getObject('activeuser').employeeId.callingname);

           fillCombo3(cmbGuardian,"Select Guardian",guardians,"nic","initialname","");


            //convert to string
            student.studentstatus_id=JSON.parse(cmbStudentstatus.value);
            cmbStudentstatus.disabled = true;

            student.employee_id=JSON.parse(cmbAddedBy.value);
            cmbAddedBy.disabled = true;

            var today = new Date();            //create date object
             var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
             if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
             var date = today.getDate();        // 1 to 31 range
             if(date<10) date = "0"+date;

            dteAddeddate.value=today.getFullYear()+"-"+month+"-"+date;
            student.asigndate=dteAddeddate.value;
            dteAddeddate.disabled = true;

            // Student B'Day Validation
           /* dtesDOB.max = today.getFullYear() - 5 + "-01-31";
            dtesDOB.min = today.getFullYear() - 10 + "-01-01";*/

            // Get Next Number Form Data Base
            var nextNumber = httpRequest("/student/nextnumber", "GET");
            txtsRegNo.value = nextNumber.regno;
            student.regno = txtsRegNo.value;
            txtsRegNo.disabled="disabled";

            //load wenakota text field empty
            txtsCName.value = "";
            txtsInitialName.value = "";
            txtsFullName.value = "";
            dtesDOB.value = "";

            txtPhone.value = "";
            txtEmergencyPhone.value = "";
            txtPreSchool.value = "";
            txtAddress.value = "";
            txtHealth.value = "";
            txtsDescription.value = "";

            //clear the photo field
            removeFile('flePhoto');
            removeFile('imgViewPhoto1');
            removeFile('imgViewPhoto2');
            removeFile('imgViewPhoto3');

            //disable when loading
            docSchoolLeaving.disabled = true;

            //auto load disable ewata valid color enawa
            setStyle(initial);
            dteAddeddate.style.border=valid;
            cmbStudentstatus.style.border=valid;
            cmbAddedBy.style.border=valid;
            txtsRegNo.style.border=valid;

             disableButtons(false, true, true);
        }

        function setStyle(style) {

            $("#selectcmbGuardianParent .select2-container").css('border', style);
            txtsRegNo.style.border = style;
            txtsCName.style.border = style;
            txtsInitialName.style.border = style;
            txtEmergencyPhone.style.border = style;
            txtsFullName.style.border = style;
            dtesDOB.style.border = style;
            txtPhone.style.border = style;
            txtPreSchool.style.border = style;
            txtAddress.style.border = style;
            txtHealth.style.border = style;
            txtsDescription.style.border = style;

            cmbsGender.style.border = style;
            cmbsReligion.style.border = style;
            cmbGuardian.style.border = style;
            cmbGramaniladari.style.border = style;
            cmbGrade.style.border = style;

            dteAddeddate.style.border = style;
            cmbStudentstatus.style.border = style;
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
            for(index in students){
                if(students[index].studentstatus_id.name =="Deleted"){
                    tblStudent.children[1].children[index].style.color = "#f00";
                    tblStudent.children[1].children[index].style.border = "2px solid red";
                    tblStudent.children[1].children[index].lastChild.children[1].disabled = true;
                    tblStudent.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";

                }
            }

        }

  /*      function dteDOBirthCH() {
            var today = new Date();
            var birthday = new Date(dtesDOB.value);
            if((today.getTime()-birthday.getTime())>(6*365*24*3600*1000)) {
                student.dob = dtesDOB.value;
                dtesDOB.style.border = valid;
            }
            else
            {
                student.dob = null;
                dtesDOB.style.border = invalid;
            }
        }*/

        function getErrors() {

            var errors = "";
            addvalue = "";

            if (student.cname == null)
                errors = errors + "\n" + "Calling Name is Not Entered";
            else  addvalue = 1;

            if (student.initialname == null)
                errors = errors + "\n" + "Name with Initials is Not Entered";
            else  addvalue = 1;

            if (student.fullname == null)
                errors = errors + "\n" + "Full Name is Not Entered";
            else  addvalue = 1;

            if (student.grade_id == null)
                errors = errors + "\n" + "Added Grade is Not Entered";
            else  addvalue = 1;
            /*else  {
                if (JSON.parse(cmbGrade.value).name == "Grade 2" || JSON.parse(cmbGrade.value).name == "Grade 3" ||
                    JSON.parse(cmbGrade.value).name == "Grade 4" || JSON.parse(cmbGrade.value).name == "Grade 5" ){

                    if (student.docschoolleaving == null)
                        errors = errors + "\n" + "School Leaving Setificate is Not Uploaded";
                    else  addvalue = 1;
                }
            }*/


            if (student.dob == null)
                errors = errors + "\n" + "Date of Birth is Not Entered";
            else  addvalue = 1;

            if (student.gender_id == null)
                errors = errors + "\n" + "Gender is Not Entered";
            else  addvalue = 1;

            if (student.religion_id == null)
                errors = errors + "\n" + "Religion is Not Entered";
            else  addvalue = 1;

           if (student.guardian_id == null)
               errors = errors + "\n" + "Guardian is Not Entered";
           else  addvalue = 1;

            if (student.phone == null)
                errors = errors + "\n" + "Phone Number is Not Entered";
            else  addvalue = 1;

            if (student.emergencynumber == null)
                errors = errors + "\n" + "Emergency Contact Number is Not Entered";
            else  addvalue = 1;

            if (student.gramaniladaridevision_id == null)
                errors = errors + "\n" + "Grama Nladari Devision Type is Not Entered";
            else  addvalue = 1;



            if (student.address == null)
                errors = errors + "\n" + "Address is Not Entered";
            else  addvalue = 1;

            if (student.healthcondition == null)
                errors = errors + "\n" + "Health condition is Not Entered";
            else  addvalue = 1;

            if (student.docbirthsetificate == null)
                errors = errors + "\n" + "Birth Setificate is Not Submitted";
            else  addvalue = 1;

            if (student.docgrama == null)
                errors = errors + "\n" + "Living Setificate is Not Submitted";
            else  addvalue = 1;

            /*if (docBirth.checked == "")
                errors = errors + "\n" + "Birth Setificate is Not Submitted";
            else  addvalue = 1;

            if (docGrama.checked == "")
                errors = errors + "\n" + "Living Setificate is Not Submitted";
            else  addvalue = 1;*/

            return errors;

        }

        function btnAddMC(){
            if(getErrors()==""){
                if(txtPreSchool.value == "" || txtsDescription.value == "" ){
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

            var docbirthsetificate = "";
            if(student.docbirthsetificate != false) docbirthsetificate = "Birth Setificate is entered";
            else docbirthsetificate = "Birth Setificate is Not Submitted";

            var docgrama = "";
            if(student.docgrama != false) docgrama = "Living Setificate is entered";
            else docgrama = "LLiving Setificate is Not Submitted";


            swal({
                title: "Are you sure to add following Student...?" ,
                text :
                    "\n Register Number : " + student.regno +
                    "\n Name with Initials : " + student.initialname +
                    "\nAdded Grade : " + student.grade_id.name +
                    "\nstudent Status : " + student.studentstatus_id.name,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/student", "POST", student);
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

            if(oldstudent == null && addvalue == ""){
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

        function fillForm(stu,rowno){
            activerowno = rowno;
            if (oldstudent==null) {        //edit karanna kalin object eka
                filldata(stu);
            } else {
                swal({
                    title: "Form has some values. Are you sure to discard the form ?",
                    text: "\n" ,
                    icon: "warning", buttons: true, dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        filldata(stu);
                    }
                });
            }
        }

        //when updating refill data into form
        function filldata(stu) {
            clearSelection(tblStudent);    //thiyana selected row ain wela aluth eka replace wenawa
            selectRow(tblStudent,activerowno,active);

            //json string ekakata covert karala java script objectect ekak karanawa
            student = JSON.parse(JSON.stringify(stu));
            oldstudent = JSON.parse(JSON.stringify(stu));

            txtsRegNo.value = student.regno;
            txtsCName.value = student.cname;
            txtsInitialName.value = student.initialname;
            txtsFullName.value = student.fullname;
            dtesDOB.value = student.dob;

            imgViewPhoto1.src = atob(student.docbirthsetificate);
            imgViewPhoto1.style.display = "block";
            imgViewPhoto2.src = atob(student.docgrama);
            imgViewPhoto2.style.display = "block";
          /*  imgViewPhoto3.src = atob(student.docschoolleaving);
            imgViewPhoto3.style.display = "block";*/

            txtEmergencyPhone.value = student.emergencynumber;
            txtPhone.value = student.phone;
            txtAddress.value = student.address;
            txtHealth.value = student.healthcondition;

            if (student.preschoolname != null) txtPreSchool.value = student.preschoolname; else txtPreSchool.value="";
            if (student.description != null) txtsDescription.value = student.description; else txtsDescription.value="";

            setDefaultFile('flePhoto', student.photo);

            //fill combo predefine functtion ekak
            //fill data in to combo box
            fillCombo(cmbsGender,"",genders,"name",student.gender_id.name);
            fillCombo(cmbsReligion,"",religions,"name",student.religion_id.name);
            fillCombo(cmbGramaniladari,"",gramaniladaridevisions,"name",student.gramaniladaridevision_id.name);
            fillCombo(cmbGrade,"",grades,"name",student.grade_id.name);
         //   fillCombo3(cmbGuardian,"",guardians,"initialname",student.guardian_id.initialname);
            fillCombo3(cmbGuardian,"",guardians,"nic","initialname",student.guardian_id.initialname);

            //fill and auto select , auto bind
            fillCombo(cmbStudentstatus,"",studentstatusts,"name",student.studentstatus_id.name);
            cmbStudentstatus.disabled = false;             //update ekedith disable
            fillCombo(cmbAddedBy,"",employees,"callingname",student.employee_id.callingname);

            //refil the photo on update
            setDefaultFile('flePhoto', student.photo);
            // setDefaultFile('imgViewPhoto1', student.docbirthsetificate);
            // setDefaultFile('imgViewPhoto2', student.docgrama);
            // setDefaultFile('imgViewPhoto3', student.docschoolleaving);

            disableButtons(true, false, false);
            setStyle(valid);
            changeTab('form');

            //optional fields walata color eka set karanawa
            if(student.preschoolname == null) txtPreSchool.style.border = initial;
            if(student.description == null) txtsDescription.style.border = initial;
        }

        //chande una ewa catch karanwa
        function getUpdates() {

            var updates = "";

            if(student!=null && oldstudent!=null) {

                if (student.photo != student.photo)
                    updates = updates + "\nPhoto is Changed";

                if (student.cname != oldstudent.cname)
                    updates = updates + "\nCalling name is Changed " + oldstudent.cname + " into " + student.cname;

                if (student.initialname != oldstudent.initialname)
                    updates = updates + "\nName with Initials is Changed " + oldstudent.initialname + " into " + student.initialname;

                if (student.fullname != oldstudent.fullname)
                    updates = updates + "\nFull Name is Changed " + oldstudent.fullname + " into " + student.fullname;

                if (student.grade_id.name != oldstudent.grade_id.name)
                    updates = updates + "\nGrade is Changed " + oldstudent.grade_id.name + " into " + student.grade_id.name;

                if (student.dob != oldstudent.dob)
                    updates = updates + "\nDate of birth is Changed " + oldstudent.dob + " into " + student.dob;

                if (student.gender_id.name != oldstudent.gender_id.name)
                    updates = updates + "\nGender is Changed " + oldstudent.gender_id.name + " into " + student.gender_id.name;

                if (student.guardian_id.cname != oldstudent.guardian_id.cname)
                    updates = updates + "\nGuardian is Changed " + oldstudent.guardian_id.cname + " into " + student.guardian_id.cname;

                if (student.religion_id.name != oldstudent.religion_id.name)
                    updates = updates + "\nReligion is Changed " + oldstudent.religion_id.name + " into " + student.religion_id.name;

                if (student.gramaniladaridevision_id.name != oldstudent.gramaniladaridevision_id.name)
                    updates = updates + "\nGN Devision is Changed " + oldstudent.gramaniladaridevision_id.name + " into " + student.gramaniladaridevision_id.name;


                if (student.emergencynumber != oldstudent.emergencynumber)
                    updates = updates + "\nEmergency Contact Number is Changed " + oldstudent.emergencynumber + " into " + student.emergencynumber;

                if (student.phone != oldstudent.phone)
                    updates = updates + "\nPhone Number is Changed " + oldstudent.phone + " into " + student.phone;

                if (student.preschoolname != oldstudent.preschoolname)
                    updates = updates + "\nPre school Name is Changed " + oldstudent.preschoolname + " into " + student.preschoolname;

                if (student.studentstatus_id.name != oldstudent.studentstatus_id.name)
                    updates = updates + "\nStatus is Changed " + oldstudent.studentstatus_id.name + " into " + student.studentstatus_id.name;

                if (student.address != oldstudent.address)
                    updates = updates + "\nAddress is Changed " + oldstudent.address + " into " + student.address;

                if (student.healthcondition != oldstudent.healthcondition)
                    updates = updates + "\nHealth Condition is Changed " + oldstudent.healthcondition + " into " + student.healthcondition;

                if (student.description != oldstudent.description)
                    updates = updates + "\nDescription is Changed " + oldstudent.description + " into " + student.description;

                if (student.docbirthsetificate != student.docbirthsetificate)
                    updates = updates + "\nBirth Setificate is Changed";

                if (student.docgrama != student.docgrama)
                    updates = updates + "\nLiving Setificate is Changed";

                if (student.docschoolleaving != student.docschoolleaving)
                    updates = updates + "\nSchool Leaving Setificate is Changed";

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
                        title: "Are you sure to update following student details?",
                        text: "\n"+ getUpdates(),
                        icon: "warning", buttons: true, dangerMode: true,
                    })
                        .then((willDelete) => {
                        if (willDelete) {
                            var response = httpRequest("/student", "PUT", student);
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

        function btnDeleteMC(stu) {
            student = JSON.parse(JSON.stringify(stu));     //json string ekak karala object ekakta convert karanwa

            swal({
                title: "Are you sure to delete following student?",
                text:
                    "\n Reg Number : " + student.regno +
                    "\n Name with Initials : " + student.initialname +
                    "\n Added Grade : " + student.grade_id.name +
                    "\n Status : " + student.studentstatus_id.name,
                icon: "warning", buttons: true, dangerMode: true,
            }).then((willDelete)=> {
                if (willDelete) {
                    var responce = httpRequest("/student","DELETE",student);
                    if (responce==0) {
                        swal({
                            title: "Deleted SuccessfullY!",
                            text: "\n\n  Status change to delete",
                            icon: "success", button: false, timer: 1200,
                        });
                        loadSearchedTable();
                        loadForm();
                    } else {
                        swal({
                            title: "You have following erros!",
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

            loadTable(activepage,cmbPageSize.value,query);        // for load table

            //disable delete button when searching
            disableButtons(false, true, true);

        }

        function btnSearchMC(){
            activepage=1;
            loadSearchedTable();
        }

        //*************
        function btnSearchClearMC(){
               loadView();
        }

        //table print
       function btnPrintTableMC() {

           var newwindow=window.open();
           formattab = tblStudent.outerHTML;

           newwindow.document.write("" +
               "<html>" +
               "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
               "<link rel='stylesheet' href='../resources/bootstrap/css/bootstrap.min.css'/></head>" +
               "<body><div style='margin-top: 100px; text-align: center; font-size:10px; '> <h1> Student Details </h1> </div>" +
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

        function cmbDOBCH(){

            var today = new Date();            //create date object
            var month = today.getMonth()+1;     //get month (array eka 0 walin patan ganna nisa +1)
            if(month<10) month = "0"+month;      //mm digits dekak nisa 10 adu ewata issarhata 0 danawa
            var date = today.getDate();        // 1 to 31 range
            if(date<10) date = "0"+date;

            if(student.grade_id.name == "Grade 1"){
                dtesDOB.max = today.getFullYear() - 5 + "-02-01";
                dtesDOB.min = today.getFullYear() - 6 + "-01-31";
            }else if (student.grade_id.name == "Grade 2") {
                dtesDOB.max = today.getFullYear() - 6 + "-02-01";
                dtesDOB.min = today.getFullYear() - 7 + "-01-31";
            } else if (student.grade_id.name == "Grade 3"){
                dtesDOB.max = today.getFullYear() - 7 + "-02-01";
                dtesDOB.min = today.getFullYear() - 8 + "-01-31";
            } else if(student.grade_id.name == "Grade 4"){
                dtesDOB.max = today.getFullYear() - 8 + "-02-01";
                dtesDOB.min = today.getFullYear() - 9 + "-01-31";
            }else if(student.grade_id.name == "Grade 5"){
                dtesDOB.max = today.getFullYear() - 9 + "-02-01";
                dtesDOB.min = today.getFullYear() - 10 + "-01-31";
            }
        }

        // required school leaving setificate when added grade 2, 3, 4, 5
        function docSchLeavingCH(){
            if(JSON.parse(cmbGrade.value).name == "Grade 2" || JSON.parse(cmbGrade.value).name == "Grade 3" ||
                JSON.parse(cmbGrade.value).name == "Grade 4" || JSON.parse(cmbGrade.value).name == "Grade 5" ){
                docSchoolLeaving.disabled = false;
                docSchoolLeaving.required = true;
            }else {
                docSchoolLeaving.disabled = true;
                docSchoolLeaving.required = false;
            }
        }
