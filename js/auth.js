// js/auth.js

// Function to register a new user
async function registerUser(email, password) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to register');
    }

    alert('Usuário registrado com sucesso!');
    window.location.href = 'login.html';
  } catch (error) {
    alert(error.message);
  }
}

// Function to log in a user
async function loginUser(email, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to login');
    }

    const { user } = await response.json();
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    window.location.href = 'profile.html';
  } catch (error) {
    alert(error.message);
  }
}

// Function to log out a user
function logoutUser() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
}

// Function to get the logged-in user
function getLoggedInUser() {
  const user = localStorage.getItem('loggedInUser');
  if (!user) {
    return null;
  }
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing loggedInUser from localStorage:', error);
    // If parsing fails, the stored value is invalid.
    // Remove the invalid item and treat the user as logged out.
    localStorage.removeItem('loggedInUser');
    return null;
  }
}

// Function to check if a user is logged in
function isLoggedIn() {
  return !!getLoggedInUser();
}

document.addEventListener('DOMContentLoaded', function() {
  const loggedInUser = getLoggedInUser();
  const pathParts = window.location.pathname.split('/');
  const currentPage = pathParts[pathParts.length - 1];
  const modulePart = pathParts.find(part => part.startsWith('modulo'));
  const moduleId = modulePart ? modulePart.replace('.html', '') : null;

  // This part of the code is for pages that require login
  if (currentPage.includes('aula') || currentPage.includes('profile')) {
    if (!isLoggedIn()) {
      alert("Você precisa estar logado para acessar esta página.");
      window.location.href = 'login.html';
      return;
    }
  }

  // Logic for course access
  if (currentPage.includes('aula')) {
    const userData = getLoggedInUser();
    const lessonModuleId = pathParts[pathParts.length - 2];
    // This is a placeholder for checking course access.
    // You would need to implement a way to store and check which courses a user has purchased.
    // For now, we will just check if the user is logged in.
    console.log(`Checking access for user ${userData.email} to module ${lessonModuleId}`);
  }


  // User Profile Dropdown Logic
  const profileButton = document.getElementById('profileButton');
  const profileDropdownContent = document.getElementById('profileDropdownContent');
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const logoutLink = document.getElementById('logoutLink');
  const profileIcon = document.querySelector('.profile-icon');

  if (profileButton && profileDropdownContent) {
    profileButton.addEventListener('click', function() {
      profileDropdownContent.classList.toggle('show');
    });

    window.addEventListener('click', function(event) {
      if (!event.target.matches('#profileButton') && !event.target.closest('.profile-dropdown')) {
        if (profileDropdownContent.classList.contains('show')) {
          profileDropdownContent.classList.remove('show');
        }
      }
    });

    function updateDropdownLinks() {
      if (isLoggedIn()) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'block';

        // Load profile picture
        const user = getLoggedInUser();
        if (user && profileIcon) {
            let userProfilePicture = localStorage.getItem(`${user.email}_profilePicture`);
            if (userProfilePicture) {
                profileIcon.src = userProfilePicture;
            }
        }
      } else {
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        logoutLink.style.display = 'none';
      }
    }
    updateDropdownLinks();

    if (logoutLink) {
      logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
      });
    }
  }
});
