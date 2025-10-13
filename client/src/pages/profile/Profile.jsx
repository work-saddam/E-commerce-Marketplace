import { useSelector } from "react-redux";
import addressLogo from "../../assets/address-map-pin.png";
import profilePhoto from "../../assets/profile-photo.png";
import orderPhoto from "../../assets/order-photo.png";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useSelector((store) => store.user);

  const cards = [
    {
      img: profilePhoto,
      title: "Profile Information",
      desc: "Edit your profile",
      link: "/account/editProfile",
    },
    {
      img: addressLogo,
      title: "Manage Addresses",
      desc: "Edit addresses for orders",
      link: "/account/addresses",
    },
    {
      img: orderPhoto,
      title: "Your Orders",
      desc: "Track your orders",
      link: "/account/orders",
    },
  ];

  return (
    <div className="m-4 sm:p-4 ">
      <h3 className="font-medium text-2xl sm:text-3xl mb-6">
        Hey {user?.name}
      </h3>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <Link to={card.link} key={i}>
            <div className="flex items-center gap-4 border p-4 rounded-xl cursor-pointer">
              <img
                className="w-14 h-14 sm:w-18 sm:h-18 object-contain"
                src={card.img}
                alt={card.title}
              />
              <div>
                <p className="font-medium">{card.title}</p>
                <p className="text-gray-500 text-sm">{card.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Profile;
