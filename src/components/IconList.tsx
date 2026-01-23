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
import { IoSchool } from "react-icons/io5";
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
  categories: string;
}

const IconList: React.FC<IconListProps> = ({ categories }) => {
  const cats: ResourceType[] = categories.split(", ") as ResourceType[];
  return (
    <div className={styles.iconRow}>{cats.map((cat) => iconMap[cat])}</div>
  );
};

const iconMap: { [key in ResourceType]: React.ReactNode } = {
  "Addiction/Substance Use": (
    <CgPill
      title="Addiction & Substance Abuse"
      key="Addiction & Substance Abuse"
    />
  ),
  "Animal & Pet Services": (
    <PiDogFill title="Animal & Pet Services" key="Animal" />
  ),
  "Arts & Entertainment": (
    <FaTheaterMasks title="Arts & Entertainment" key="Arts" />
  ),
  "Career Development & Employment": (
    <FaBriefcase title="Career Development & Employment" key="Career" />
  ),
  "Case Management & Resource Navigation": (
    <FaBriefcaseMedical
      title="Case Management & Resource Navigation"
      key="Case"
    />
  ),
  "Child Support & Youth Services": (
    <FaChildren title="Child Support & Youth Services" key="Child" />
  ),
  "Community Health Center": (
    <PiHospitalFill title="Community Health Centers" key="Community" />
  ),
  "Cultural & Language Services": (
    <FaEarthAfrica title="Cultural & Language Services" key="Cultural" />
  ),
  Disability: <BiHandicap title="Disability" key="Disability" />,
  "Domestic Violence & Trauma Survivorship": (
    <PiBandaidsFill
      title="Domestic Violence & Trauma Survivorship"
      key="Domestic"
    />
  ),
  Education: <IoSchool title="Education" key="Education" />,
  "Environmentalism & Sustainability": (
    <RiPlantFill
      title="Environmentalism & Sustainability"
      key="Environmentalism"
    />
  ),
  "Extreme Weather/Wildfires & Disaster Relief": (
    <PiFireTruckFill
      title="Extreme Weather/Wildfires & Disaster Relief"
      key="Extreme"
    />
  ),
  "Family Planning & Reproductive Health": (
    <MdOutlineFamilyRestroom
      title="Family Planning & Reproductive Health"
      key="FamilyPlanning"
    />
  ),
  "Financial Assistance": (
    <AiFillDollarCircle title="Financial Assistance" key="Financial" />
  ),
  "Fitness & Wellness": (
    <IoFitnessSharp title="Fitness & Wellness" key="Fitness" />
  ),
  "Food & Nutrition Assistance": (
    <TbAppleFilled title="Food & Nutrition Assistance" key="Food & Nutrition" />
  ),
  "Free Items/Donations": (
    <BsFillBoxSeamFill
      title="Free Items/Donations"
      key="Free Items/Donations"
    />
  ),
  "Health Insurance": (
    <RiHealthBookFill title="Health Insurance" key="Health" />
  ),
  "Housing & Shelters": (
    <FaHouseChimney title="Housing & Shelters" key="Housing" />
  ),
  "Human Trafficking": (
    <FaHandHoldingHeart title="Human Trafficking" key="Trafficking" />
  ),
  Hygiene: <FaBath title="Hygiene" key="Hygiene" />,
  "Legal Services": <VscLaw title="Legal Services" key="Legal" />,
  "LGBT Services": <FaRainbow title="LGBT Services" key="LGBT" />,
  "Medical Services": <FaTruckMedical title="Medical Services" key="Medical" />,
  "Mental Health & Counseling": (
    <RiMentalHealthFill title="Mental Health & Counseling" key="Mental" />
  ),
  "Spiritual Services": <FaPray title="Spiritual Services" key="Spiritual" />,
  Transportation: <FaBusAlt title="Transportation" key="Transportation" />,
  "Undocumented/Refugee/Asylum Services": (
    <FaRibbon title="Undocumented/Refugee/Asylum Services" key="Undocumented" />
  ),
};

export default IconList;
