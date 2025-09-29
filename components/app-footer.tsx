const AppFooter = () => {

  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4 flex items-center">
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Mandat
              </h3>
            </div>
            <p className="mb-4 max-w-md text-gray-400">
              The future of decentralized governance and community petitions
              powered by blockchain technology.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <img
                  src="https://placeholder-image-service.onrender.com/image/32x32?prompt=Twitter%20logo%20icon%20with%20blue%20bird&id=social-1"
                  alt="Twitter social media icon with blue bird logo"
                  className="h-6 w-6"
                />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <img
                  src="https://placeholder-image-service.onrender.com/image/32x32?prompt=Discord%20logo%20icon%20with%20purple%20game%20controller&id=social-2"
                  alt="Discord social media icon with purple game controller logo"
                  className="h-6 w-6"
                />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <img
                  src="https://placeholder-image-service.onrender.com/image/32x32?prompt=GitHub%20logo%20icon%20with%20black%20cat&id=social-3"
                  alt="GitHub social media icon with black cat logo"
                  className="h-6 w-6"
                />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <img
                  src="https://placeholder-image-service.onrender.com/image/32x32?prompt=Telegram%20logo%20icon%20with%20blue%20paper%20airplane&id=social-4"
                  alt="Telegram social media icon with blue paper airplane logo"
                  className="h-6 w-6"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">
            © 2025 Mandat. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-6 sm:mt-0">
            <a
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-white"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 transition-colors hover:text-white"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;