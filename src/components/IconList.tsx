import React from "react";
import { FaHouseChimney } from "react-icons/fa6";
import { CgPill } from "react-icons/cg";
import { PiDogFill } from "react-icons/pi";
import { FaTheaterMasks } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa6";
import { FaBriefcaseMedical } from "react-icons/fa";
import { FaChildren } from "react-icons/fa6";
import { PiHospitalFill } from "react-icons/pi";
import { FaEarthAfrica } from "react-icons/fa6";
import { BiHandicap } from "react-icons/bi";
import { PiBandaidsFill } from "react-icons/pi";
import { SiBookstack } from "react-icons/si";
import { RiPlantFill } from "react-icons/ri";
import { PiFireTruckFill } from "react-icons/pi";
import { MdOutlineFamilyRestroom } from "react-icons/md";
import { AiFillDollarCircle } from "react-icons/ai";
import { IoFitnessSharp } from "react-icons/io5";
import { TbAppleFilled } from "react-icons/tb";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { RiHealthBookFill } from "react-icons/ri";
import { FaHandHoldingHeart } from "react-icons/fa6";
import { FaBath } from "react-icons/fa6";
import { VscLaw } from "react-icons/vsc";
import { FaRainbow } from "react-icons/fa6";
import { FaTruckMedical } from "react-icons/fa6";
import { RiMentalHealthFill } from "react-icons/ri";
import { FaPray } from "react-icons/fa";
import { FaBusAlt } from "react-icons/fa";
import { FaRibbon } from "react-icons/fa";

import type { ResourceType } from "../types/types";

import styles from "../styles/IconList.module.css";

interface IconListProps {
  categories: ResourceType[];
}

const IconList: React.FC<IconListProps> = ({ categories }) => {
  return (
    <div className={styles.iconRow}>
      {categories.map((category) => iconMap[category])}
    </div>
  );
};

const iconMap: { [key in ResourceType]: React.ReactNode } = {
  "Addiction/Substance Use": <CgPill title="Addiction & Substance Abuse" />,
  "Animal & Pet Services": <PiDogFill title="Animal & Pet Services" />,
  "Arts & Entertainment": <FaTheaterMasks title="Arts & Entertainment" />,
  "Career Development & Employment": (
    <FaBriefcase title="Career Development & Employment" />
  ),
  "Case Management & Resource Navigation": (
    <FaBriefcaseMedical title="Case Management & Resource Navigation" />
  ),
  "Child Support & Youth Services": (
    <FaChildren title="Child Support & Youth Services" />
  ),
  "Community Health Center": (
    <PiHospitalFill title="Community Health Centers" />
  ),
  "Cultural & Language Services": (
    <FaEarthAfrica title="Cultural & Language Services" />
  ),
  Disability: <BiHandicap title="Disability" />,
  "Domestic Violence & Trauma Survivorship": (
    <PiBandaidsFill title="Domestic Violence & Trauma Survivorship" />
  ),
  Education: <SiBookstack title="Education" />,
  "Environmentalism & Sustainability": (
    <RiPlantFill title="Environmentalism & Sustainability" />
  ),
  "Extreme Weather/Wildfires & Disaster Relief": (
    <PiFireTruckFill title="Extreme Weather/Wildfires & Disaster Relief" />
  ),
  "Family Planning & Reproductive Health": (
    <MdOutlineFamilyRestroom title="Family Planning & Reproductive Health" />
  ),
  "Financial Assistance": <AiFillDollarCircle title="Financial Assistance" />,
  "Fitness & Wellness": <IoFitnessSharp title="Fitness & Wellness" />,
  "Food & Nutrition Assistance": (
    <TbAppleFilled title="Food & Nutrition Assistance" />
  ),
  "Free Items/Donations": <BsFillBoxSeamFill title="Free Items/Donations" />,
  "Health Insurance": <RiHealthBookFill title="Health Insurance" />,
  "Housing & Shelters": <FaHouseChimney title="Housing & Shelters" />,
  "Human Trafficking": <FaHandHoldingHeart title="Human Trafficking" />,
  Hygiene: <FaBath title="Hygiene" />,
  "Legal Services": <VscLaw title="Legal Services" />,
  "LGBT Services": <FaRainbow title="LGBT Services" />,
  "Medical Services": <FaTruckMedical title="Medical Services" />,
  "Mental Health & Counseling": (
    <RiMentalHealthFill title="Mental Health & Counseling" />
  ),
  "Spiritual Services": <FaPray title="Spiritual Services" />,
  Transportation: <FaBusAlt title="Transportation" />,
  "Undocumented/Refugee/Asylum Services": (
    <FaRibbon title="Undocumented/Refugee/Asylum Services" />
  ),
};

export default IconList;
