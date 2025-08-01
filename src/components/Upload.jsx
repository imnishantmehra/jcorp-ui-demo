import { useRef, useState } from "react";
import { api } from "../API_Service/apiService";

function Upload() {
  const [file, setFile] = useState(null);
  const [convertedFileUrl, setConvertedFileUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [companyDetails, setCompanyDetails] = useState({
    old_keywords: "",
    new_keywords: "",
    old_company_number: "",
    new_company_number: "",
  });
  const fileInputRef = useRef(null);
  // const dropRef = useRef(null);

  // const handleFileChange = (e) => {
  //   const selectedFile = e.target.files[0];
  //   if (selectedFile) {
  //     setFile(selectedFile);
  //     setUploadSuccess(true);
  //     setConvertedFileUrl(null);
  //   }
  // };

  // const handleDrop = (e) => {
  //   e.preventDefault();
  //   const droppedFile = e.dataTransfer.files[0];
  //   if (
  //     droppedFile &&
  //     droppedFile.type ===
  //       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  //   ) {
  //     setFile(droppedFile);
  //     setUploadSuccess(true);
  //     setConvertedFileUrl(null);
  //   }
  // };

  // const handleDragOver = (e) => {
  //   e.preventDefault();
  //   dropRef.current.classList.add("border-[#000045]");
  // };

  // const handleDragLeave = () => {
  //   dropRef.current.classList.remove("border-[#000045]");
  // };

  const handleFileUpload = async (inputFile) => {
    let selectedFile;
    if (inputFile.target) {
      selectedFile = inputFile.target.files[0]; // from <input>
    } else {
      selectedFile = inputFile; // from drag-and-drop
    }

    if (!selectedFile) {
      alert("File not found");
      return;
    }

    setFile(selectedFile);

    // Validate all companyDetails fields are filled
    if (
      Object.keys(companyDetails).some(
        (key) => companyDetails[key].trim() === ""
      )
    ) {
      alert("All fields must be filled.");
      removeFile();
      return;
    }

    setIsLoading(true);
    console.log("companyDetails", companyDetails);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Append each companyDetails key-value to formData
      for (const key in companyDetails) {
        formData.append(key, companyDetails[key]);
      }

      // Make POST request
      const response = await api.post("replace-keyword-preview", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await handleDownloadUpdatedFile(response.token);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.message || "Upload failed");
      removeFile();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadUpdatedFile = async (token) => {
    if (!token) {
      alert("Error From Server, please try again");
      return;
    }

    try {
      const response = await api.get(`download-updated-docx?token=${token}`, {
        responseType: "blob", // If you're downloading a file
      });

      const contentType =
        response.type || response.headers?.get?.("content-type");
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        const json = JSON.parse(text);
        throw new Error(
          json?.error || json?.message || "Server error during file download."
        );
      }

      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "updatedFile.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(`Error downloading file`);
    }
  };
  console.log("file state", file);

  const removeFile = () => {
    setFile(null);
    setUploadSuccess(false);
    setConvertedFileUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyDetails((prevDetails) => {
      const newValue = value
        .split(",")
        .map((keyword) => keyword.trim())
        .join(",");
      return {
        ...prevDetails,
        [name]: newValue,
      };
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-gray-800 font-[Avenir-Book]">
      <p className="mb-2 text-sm text-gray-700 font-[Avenir-Medium]">
        📄 Upload your <span className="text-green-600">.docx</span> agreement
        file below
      </p>

      {/* <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="flex flex-col items-center justify-center p-6 mb-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 transition hover:border-[#000045]"
      >
        <p className="text-sm text-gray-500 mb-2">Drag and drop file here</p>
        <p className="text-xs text-gray-400">Limit 200MB per file • DOCX</p>
        <input
          type="file"
          accept=".docx"
          onChange={handleFileChange}
          className="hidden"
          id="fileUpload"
        />
        <label
          htmlFor="fileUpload"
          className="mt-4 inline-block px-4 py-2 bg-white text-[#000045] border border-[#000045] text-sm rounded-md cursor-pointer hover:bg-[#000045] hover:text-white transition font-[Avenir-Medium]"
        >
          Browse files
        </label>
      </div> */}

      <div>
        <div className="mt-4 p-4 border rounded-lg bg-white">
          <div className="bg-gray-100 border border-gray-200 p-4 rounded-md shadow-sm mt-4">
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Enter old keywords (Separated by comma)
            </label>
            <input
              type="text"
              placeholder="Enter old keywords"
              name="old_keywords"
              value={companyDetails.old_keywords}
              onChange={handleChange}
              className="w-full p-2 mb-2 border rounded"
            />
            <label className="block text-sm font-medium text-gray-700">
              Enter new keywords (Separated by comma)
            </label>
            <input
              type="text"
              placeholder="Enter new keywords"
              name="new_keywords"
              value={companyDetails.new_keywords}
              onChange={handleChange}
              className="w-full p-2 mb-2 border rounded"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Enter old company number
            </label>
            <input
              type="text"
              name="old_company_number"
              placeholder="Enter old company number"
              value={companyDetails.old_company_number}
              onChange={handleChange}
              className="w-full p-2 mb-2 border rounded"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Enter new company number
            </label>
            <input
              type="text"
              name="new_company_number"
              placeholder="Enter new company number"
              value={companyDetails.new_company_number}
              onChange={handleChange}
              className="w-full p-2 mb-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div
        className="p-6 bg-white shadow-md rounded-lg mx-auto mt-6"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <h2 className="text-2xl font-bold mb-2">Upload docx</h2>
        {/* {file && <p className="text-gray-600 mb-2">File Name: {file.name}</p>} */}
        <p className="text-gray-600 mb-4">Upload or drag and drop docx</p>

        <label className="border-2 border-dashed border-gray-400 rounded-lg p-10 flex flex-col items-center text-center cursor-pointer hover:border-gray-600">
          {/* <FiUpload className="w-12 h-12 text-gray-500 mb-2" /> */}
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            ref={fileInputRef}
            disabled={isLoading}
            className="hidden"
          />
          <p className="text-gray-700">
            Drag and drop docx here, or click to select
          </p>
          <p className="text-gray-500 text-sm">Limit 200MB per file • DOCX</p>
        </label>
      </div>

      {file && (
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 text-sm">{file.name}</span>
            <span className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(1)}KB
            </span>
          </div>
          <button
            onClick={removeFile}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            ✕
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="bg-green-100 text-green-700 text-sm p-3 rounded mb-4">
          ✅ File uploaded successfully!
        </div>
      )}

      <button
        onClick={handleFileUpload}
        disabled={!file || isLoading}
        className="w-full border border-[#000045] text-[#000045] py-2 rounded transition-all hover:bg-[#000045] hover:text-white flex items-center justify-center disabled:opacity-50"
      >
        {isLoading ? "Converting..." : "🔒 Convert Agreement"}
      </button>

      {convertedFileUrl && (
        <a
          href={convertedFileUrl}
          download="converted.docx"
          className="block text-center mt-6 bg-[#009260] hover:bg-[#000045] text-white py-2 px-4 rounded transition"
        >
          Download Converted DOCX
        </a>
      )}
    </div>
  );
}

export default Upload;
