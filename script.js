import { auth, db } from "./firebase.js";


import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    collection,
    getDocs,
    query,
    orderBy,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";



/* =========================
   CLOUDINARY
========================= */

const CLOUDINARY_CLOUD_NAME =
    "t2lucsiv";

const CLOUDINARY_UPLOAD_PRESET =
    "Sciencehackacademy _pdfs";
    
    



/* =========================
   ADMIN
========================= */

const ADMIN_UID =
    "AdwpZzAQt7RltcMFB81Y8uDViVw2";



/* =========================
   ELEMENTS
========================= */

const pdfList =
    document.getElementById("pdf-list");


const searchInput =
    document.getElementById("pdf-search");


const loginModal =
    document.getElementById("login-modal");


const loginBtn =
    document.getElementById("login-btn");


const loginEmail =
    document.getElementById("login-email");


const loginPassword =
    document.getElementById("login-password");


const loginMessage =
    document.getElementById("login-message");


const adminLoginBtn =
    document.getElementById("admin-login-btn");


const closeLogin =
    document.getElementById("close-login");


const adminDashboard =
    document.getElementById("admin-dashboard");


const logoutBtn =
    document.getElementById("admin-logout-btn");


const pdfFile =
    document.getElementById("pdf-file");


const pdfTitle =
    document.getElementById("pdf-title");


const pdfSubject =
    document.getElementById("pdf-subject");


const pdfGrade =
    document.getElementById("pdf-grade");


const pdfDescription =
    document.getElementById("pdf-description");


const uploadButton =
    document.getElementById("upload-pdf-btn");


const uploadStatus =
    document.getElementById("upload-status");


const adminPdfList =
    document.getElementById("admin-pdf-list");



/* =========================
   LOCAL PDF DATA
========================= */

let allPDFs = [];



/* =========================
   LOGIN MODAL
========================= */

function showLoginModal() {

    loginModal.classList.remove("hidden");

}


function hideLoginModal() {

    loginModal.classList.add("hidden");

}



/* =========================
   DASHBOARD
========================= */

function showAdminDashboard() {

    adminDashboard.classList.remove("hidden");

    loadAdminPDFs();

}


function hideAdminDashboard() {

    adminDashboard.classList.add("hidden");

}



/* =========================
   ADMIN BUTTON
========================= */

adminLoginBtn.addEventListener(
    "click",
    () => {

        const user =
            auth.currentUser;


        if (
            user &&
            user.uid === ADMIN_UID
        ) {

            showAdminDashboard();

            return;

        }


        showLoginModal();

    }
);



/* =========================
   CLOSE LOGIN
========================= */

closeLogin.addEventListener(
    "click",
    () => {

        hideLoginModal();

    }
);



/* =========================
   LOGIN
========================= */

loginBtn.addEventListener(
    "click",
    async () => {

        const email =
            loginEmail.value.trim();


        const password =
            loginPassword.value;


        if (!email || !password) {

            loginMessage.textContent =
                "Please enter your email and password.";

            return;

        }


        loginMessage.textContent =
            "Signing in...";


        try {

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            if (
                credential.user.uid !== ADMIN_UID
            ) {

                await signOut(auth);

                loginMessage.textContent =
                    "This account is not authorized as an admin.";

                return;

            }


            loginMessage.textContent =
                "Admin login successful!";


            hideLoginModal();


            showAdminDashboard();


            adminLoginBtn.textContent =
                "🛠️ Admin Dashboard";


        } catch (error) {

            console.error(
                "Firebase login error:",
                error
            );


            loginMessage.textContent =
                error.code +
                ": " +
                error.message;

        }

    }
);



/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            adminLoginBtn.textContent =
                "Admin Login";

            hideAdminDashboard();

            return;

        }


        console.log(
            "Firebase user:",
            user.email
        );


        console.log(
            "UID:",
            user.uid
        );


        if (
            user.uid !== ADMIN_UID
        ) {

            await signOut(auth);

            adminLoginBtn.textContent =
                "Admin Login";

            hideAdminDashboard();

            return;

        }


        adminLoginBtn.textContent =
            "🛠️ Admin Dashboard";

        /*
         * Do not automatically open dashboard.
         */

        hideAdminDashboard();

    }
);



/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener(
    "click",
    async () => {

        await signOut(auth);

        hideAdminDashboard();

        adminLoginBtn.textContent =
            "Admin Login";

    }
);



/* =========================
   UPLOAD PDF
========================= */

uploadButton.addEventListener(
    "click",
    uploadPDF
);



async function uploadPDF() {

    const user =
        auth.currentUser;


    if (
        !user ||
        user.uid !== ADMIN_UID
    ) {

        uploadStatus.textContent =
            "❌ Admin authentication required.";

        return;

    }


    const file =
        pdfFile.files[0];


    const title =
        pdfTitle.value.trim();


    const subject =
        pdfSubject.value.trim();


    const grade =
        pdfGrade.value.trim();


    const description =
        pdfDescription.value.trim();



    /* =========================
       VALIDATION
    ========================= */

    if (!file) {

        uploadStatus.textContent =
            "❌ Please choose a PDF.";

        return;

    }


    if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
    ) {

        uploadStatus.textContent =
            "❌ Only PDF files are allowed.";

        return;

    }


    if (!title) {

        uploadStatus.textContent =
            "❌ Please enter a PDF title.";

        return;

    }



    /* =========================
       START
    ========================= */

    uploadButton.disabled =
        true;


    uploadStatus.textContent =
        "⏳ Uploading PDF to Cloudinary...";



    try {


        /* =========================
           CLOUDINARY UPLOAD
        ========================= */

        const formData =
            new FormData();


        formData.append(
            "file",
            file
        );


        formData.append(
            "upload_preset",
            CLOUDINARY_UPLOAD_PRESET
        );

const cloudinaryResponse =
    await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
            method: "POST",
            body: formData
        }
    );
    

if (!cloudinaryResponse.ok) {

    const errorText =
        await cloudinaryResponse.text();

    console.error(
        "Cloudinary HTTP status:",
        cloudinaryResponse.status
    );

    console.error(
        "Cloudinary response:",
        errorText
    );

    throw new Error(
        "Cloudinary " +
        cloudinaryResponse.status +
        ": " +
        errorText
    );

}



        const cloudinaryData =
            await cloudinaryResponse.json();


        console.log(
            "Cloudinary upload:",
            cloudinaryData
        );


        const pdfUrl =
            cloudinaryData.secure_url;


        const publicId =
            cloudinaryData.public_id;


        /* =========================
           SAVE FIRESTORE
        ========================= */

        uploadStatus.textContent =
            "⏳ Saving PDF information...";


        await addDoc(
            collection(db, "pdfs"),
            {

                title: title,

                subject: subject,

                grade: grade,

                description: description,

                pdfUrl: pdfUrl,

                cloudinaryPublicId:
                    publicId,

                originalFileName:
                    file.name,

                createdAt:
                    serverTimestamp(),

                uploadedBy:
                    user.uid

            }
        );


        /* =========================
           SUCCESS
        ========================= */

        uploadStatus.textContent =
            "✅ PDF uploaded successfully!";


        pdfFile.value =
            "";

        pdfTitle.value =
            "";

        pdfSubject.value =
            "";

        pdfGrade.value =
            "";

        pdfDescription.value =
            "";


        await loadPDFs();

        await loadAdminPDFs();


    } catch (error) {

        console.error(
            "PDF upload error:",
            error
        );


        uploadStatus.textContent =
            "❌ Upload failed: " +
            error.message;


    } finally {

        uploadButton.disabled =
            false;

    }

}



/* =========================
   LOAD PUBLIC PDFs
========================= */

async function loadPDFs() {

    try {

        const pdfQuery =
            query(
                collection(db, "pdfs"),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(pdfQuery);


        allPDFs = [];


        snapshot.forEach(
            (item) => {

                allPDFs.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        renderPDFs(
            allPDFs
        );


    } catch (error) {

        console.error(
            "PDF loading error:",
            error
        );


        pdfList.innerHTML = `
            <div class="loading">
                ❌ Could not load PDFs.
            </div>
        `;

    }

}



/* =========================
   RENDER PUBLIC PDFs
========================= */

function renderPDFs(
    pdfs
) {

    pdfList.innerHTML =
        "";


    if (!pdfs.length) {

        pdfList.innerHTML = `
            <div class="loading">
                No PDFs found.
            </div>
        `;

        return;

    }


    pdfs.forEach(
        (pdf) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "pdf-card";


            card.innerHTML = `

                <h3>
                    📄
                    ${escapeHTML(
                        pdf.title ||
                        "Untitled PDF"
                    )}
                </h3>


                ${
                    pdf.description
                        ?
                        `
                        <p>
                            ${escapeHTML(
                                pdf.description
                            )}
                        </p>
                        `
                        :
                        ""
                }


                <div class="meta">

                    ${
                        pdf.subject
                            ?
                            escapeHTML(
                                pdf.subject
                            )
                            :
                            ""
                    }

                    ${
                        pdf.grade
                            ?
                            " • Class " +
                              escapeHTML(
                                  pdf.grade
                              )
                            :
                            ""
                    }

                </div>


                <div class="pdf-actions">

                    <a
                        class="open-pdf"
                        href="${escapeHTML(
                            pdf.pdfUrl
                        )}"
                        target="_blank"
                        rel="noopener"
                    >
                        📖 Open PDF
                    </a>


                    <a
                        class="download-pdf"
                        href="${escapeHTML(
                            pdf.pdfUrl
                        )}"
                        target="_blank"
                        rel="noopener"
                        download
                    >
                        ⬇️ Download
                    </a>

                </div>

            `;


            pdfList.appendChild(
                card
            );

        }
    );

}



/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    () => {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!search) {

            renderPDFs(
                allPDFs
            );

            return;

        }


        const filtered =
            allPDFs.filter(
                (pdf) => {

                    const title =
                        String(
                            pdf.title ||
                            ""
                        ).toLowerCase();


                    const fileName =
                        String(
                            pdf.originalFileName ||
                            ""
                        ).toLowerCase();


                    return (
                        title.includes(search) ||
                        fileName.includes(search)
                    );

                }
            );


        renderPDFs(
            filtered
        );

    }
);



/* =========================
   ADMIN PDF MANAGER
========================= */

async function loadAdminPDFs() {

    if (!adminPdfList) {
        return;
    }


    adminPdfList.innerHTML = `
        <p class="admin-help">
            Loading...
        </p>
    `;


    try {

        const pdfQuery =
            query(
                collection(db, "pdfs"),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(pdfQuery);


        adminPdfList.innerHTML =
            "";


        if (snapshot.empty) {

            adminPdfList.innerHTML = `
                <p class="admin-help">
                    No PDFs have been uploaded yet.
                </p>
            `;

            return;

        }


        snapshot.forEach(
            (item) => {

                const pdf =
                    item.data();


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "admin-pdf-row";


                row.innerHTML = `

                    <div>

                        <strong>
                            📄
                            ${escapeHTML(
                                pdf.title ||
                                "Untitled PDF"
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                pdf.originalFileName ||
                                ""
                            )}
                        </small>

                    </div>


                    <div class="admin-row-actions">

                        <a
                            href="${escapeHTML(
                                pdf.pdfUrl
                            )}"
                            target="_blank"
                            rel="noopener"
                            class="small-open"
                        >
                            Open
                        </a>


                        <button
                            type="button"
                            class="delete-pdf-button"
                            data-id="${item.id}"
                        >
                            🗑️ Remove
                        </button>

                    </div>

                `;


                adminPdfList.appendChild(
                    row
                );

            }
        );


        document
            .querySelectorAll(
                ".delete-pdf-button"
            )
            .forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            deletePDF(
                                button.dataset.id
                            );

                        }
                    );

                }
            );


    } catch (error) {

        console.error(
            "Admin PDF manager error:",
            error
        );


        adminPdfList.innerHTML = `
            <p class="admin-help">
                ❌ Could not load PDF manager.
            </p>
        `;

    }

}



/* =========================
   REMOVE PDF FROM FIRESTORE
========================= */

async function deletePDF(
    pdfId
) {

    const user =
        auth.currentUser;


    if (
        !user ||
        user.uid !== ADMIN_UID
    ) {

        alert(
            "Admin authentication required."
        );

        return;

    }


    const confirmed =
        confirm(
            "Remove this PDF from the ScienceHackAcademy library?"
        );


    if (!confirmed) {
        return;
    }


    try {

        /*
         * IMPORTANT:
         *
         * This currently removes the
         * Firestore library record.
         *
         * Cloudinary deletion will be
         * connected through the secure
         * server-side deletion step.
         */

        await deleteDoc(
            doc(
                db,
                "pdfs",
                pdfId
            )
        );


        alert(
            "PDF removed from the library."
        );


        await loadPDFs();

        await loadAdminPDFs();


    } catch (error) {

        console.error(
            "PDF deletion error:",
            error
        );


        alert(
            "Could not remove PDF."
        );

    }

}



/* =========================
   HTML SAFETY
========================= */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value);


    return div.innerHTML;

}



/* =========================
   START
========================= */

loadPDFs();
