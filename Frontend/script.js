document.getElementById("vehicleForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  try {
    const data = {
      make: document.getElementById("vehicleMake").value,
      model: document.getElementById("vehicleModel").value,
      year: parseInt(document.getElementById("year").value),
      maintenanceTask: document.getElementById("maintenanceTask").value,
      maintenanceDate: document.getElementById("maintenanceDate").value,
      mileage: parseInt(document.getElementById("mileage").value),
      policyNumber: document.getElementById("policyNumber").value,
      policyExpiration: document.getElementById("expirationDate").value
    };
    
    // Use environment-based API URL
    const apiUrl = window.location.hostname === 'localhost' 
      ? "https://localhost:5001/api/maintenance"
      : "http://backend:80/api/maintenance";
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    document.getElementById("dashboard").innerHTML = `
      <h3>Reminder Summary:</h3>
      <p>Next maintenance (${result.task}) is due on: ${result.maintenanceDate}</p>
      <p>Insurance policy expires on: ${result.policyExpiration}</p>
    `;
  } catch (error) {
    console.error('Error submitting maintenance data:', error);
    document.getElementById("dashboard").innerHTML = `
      <h3>Error:</h3>
      <p>Unable to process your request. Please try again later.</p>
      <p>Error details: ${error.message}</p>
    `;
  }
});

document.getElementById("vehicleForm").addEventListener("submit", (e) => {
  e.preventDefault();
  
  try {
    const vehicleType = document.getElementById("vehicleType").value;
    const ownerName = document.getElementById("ownerName").value;
    
    if (!vehicleType) {
      alert("Please select a vehicle type");
      return;
    }
    
    const services = getServicesForType(vehicleType);
    
    // Save to session and open new tab
    sessionStorage.setItem("vehicleType", vehicleType);
    sessionStorage.setItem("ownerName", ownerName);
    sessionStorage.setItem("services", JSON.stringify(services));
    window.open("service-selection.html", "_blank");
  } catch (error) {
    console.error('Error processing vehicle form:', error);
    alert("An error occurred while processing your request. Please try again.");
  }
});

function getServicesForType(type) {
  try {
    const serviceOptions = {
      car: [
        { name: "Oil Change", price: 50 },
        { name: "Tire Rotation", price: 30 },
        { name: "Brake Inspection", price: 40 }
      ],
      truck: [
        { name: "Transmission Check", price: 120 },
        { name: "Diesel Oil Change", price: 80 },
        { name: "Suspension Inspection", price: 70 }
      ],
      motorcycle: [
        { name: "Chain Adjustment", price: 25 },
        { name: "Brake Fluid Change", price: 35 },
        { name: "Engine Tune-Up", price: 60 }
      ]
    };
    return serviceOptions[type] || [];
  } catch (error) {
    console.error('Error getting services for type:', error);
    return [];
  }
}