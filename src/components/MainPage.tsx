// src/components/MainPage.tsx
import React, { useContext, useEffect, useState } from "react";
import DriveUploady from "drive-uploady";
import UploadButton from "@rpldy/upload-button";

import { AuthContext } from "../context/AuthContext";
import {
  createFile,
  listFiles,
  downloadFile,
  deleteFile,
} from "../services/googleApi";

const MainPage: React.FC = () => {
  const { isSignedIn, signIn, signOut } = useContext(AuthContext);
  const [files, setFiles] = useState<gapi.client.drive.File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isSignedIn) {
      fetchFiles();
    } else {
      setFiles([]);
    }
  }, [isSignedIn]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const apiFiles = await listFiles();
      // Optionally filter out files without an ID
      const filesWithId = apiFiles.filter((file) => file.id);
      setFiles(filesWithId);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFile = async () => {
    try {
      const response = await createFile(
        `Sample_${new Date().toISOString()}.txt`,
        "Hello, Google Drive!"
      );
      console.log("File Created:", response);
      fetchFiles();
    } catch (error) {
      console.error("Error Creating File:", error);
    }
  };

  const handleDownloadFile = async (fileId: string) => {
    try {
      const fileContent = await downloadFile(fileId);
      const blob = new Blob([fileContent]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "downloaded_file";
      link.click();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <section>
      {isSignedIn ? (
        <section>
          <div className="mb-4">
            <button
              type="button"
              className="btn btn-lg bg-success me-3"
              onClick={handleCreateFile}
            >
              Create File
            </button>
            <DriveUploady
			        clientId="<my-client-id>"
              scope="https://www.googleapis.com/auth/drive.file"
            >
              <UploadButton >Upload to Drive</UploadButton>
            </DriveUploady>
            <button
              type="button"
              className="btn btn-lg bg-danger ms-3"
              onClick={signOut}
            >
              Sign Out
            </button>
          </div>
          <div>
            <h5>Your Files</h5>
            {loading ? (
              <div className="alert alert-primary">Loading files...</div>
            ) : files.length > 0 ? (
              <ul>
                {files.map((file) => (
                  <li key={file.id}>
                    {file.name} ({file.mimeType})
                    <button
                      className="btn btn-primary ms-3"
                      onClick={() => handleDownloadFile(file.id!)}
                    >
                      Download
                    </button>
                    <button
                      className="btn btn-danger ms-3"
                      onClick={() => handleDeleteFile(file.id!)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="alert alert-warning">No files found.</div>
            )}
          </div>
        </section>
      ) : (
        <button
          type="button"
          className="btn btn-lg bg-success"
          onClick={signIn}
        >
          Sign In with Google
        </button>
      )}
    </section>
  );
};

export default MainPage;
