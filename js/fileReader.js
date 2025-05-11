
async function readFile(file) {
    // const filePromise = new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.onload = async () => {
    //         try {
    //             const response = await this.submitFile(
    //                 reader.result,
    //                 file.name,
    //                 fileType
    //             );
    //             // Resolve the promise with the response value
    //             resolve(response);
    //         } catch (err) {
    //             reject(err);
    //         }
    //     };
    //     reader.onerror = (error) => {
    //         reject(error);
    //     };
    //     reader.readAsText(file);
    // });
        
    //   // Wait for all promises to be resolved
    //   const fileInfo = await Promise.all(filePromise);
    
    //   console.log('COMPLETED');
    
    //   // Profit
    //   return fileInfo;
    dataPromise = new Promise((resolve, reject) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const res = e.target.result;
                resolve(res);
            };

            reader.onerror = (e) => {
                console.error("File could not be read! Code " + e.target.error.code);
            };
            reader.readAsText(file); // Use readAsText for text files
        }
    });

    return await dataPromise;
}
