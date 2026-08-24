"""Prepares balanced dataset from raw 22 subfolders into Train / Val / Test splits."""

import os
import shutil
import random
from pathlib import Path
from vision_system.config.settings import BASE_DIR

RAW_PHOTOS_DIR = BASE_DIR / "data" / "photos"
DATASET_OUT_DIR = BASE_DIR / "data" / "dataset"

CATEGORY_MAPPING = {
    "Sharps_Hazard": [
        "ampoules_full", "ampuoles_broken", "used_syringes", "scalpels",
        "episiotomy_scissors", "mayo_scissors", "stitch_removal_scissors",
        "forceps", "hemostats", "tweezers", "vaccine_or_medicine_vials"
    ],
    "Biohazard_Infectious": [
        "blood_soaked_bandages", "human_organs", "general_organic_waste",
        "used_masks", "used_medical_gloves", "expired_tablets"
    ],
    "Clean_Plastic": [
        "waterbottles", "disinfectant_bottles", "iv_bottles", "syrup_bottles"
    ],
    "Clean_Paper": [
        "used_medical_paper"
    ]
}

TARGET_SAMPLES_PER_CATEGORY = 720
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15


def prepare_dataset():
    random.seed(42)
    if DATASET_OUT_DIR.exists():
        print(f"[Dataset] Cleaning existing output dir: {DATASET_OUT_DIR}")
        shutil.rmtree(DATASET_OUT_DIR)

    for split in ["train", "val", "test"]:
        for cat in CATEGORY_MAPPING.keys():
            (DATASET_OUT_DIR / split / cat).mkdir(parents=True, exist_ok=True)

    print("\n[Dataset Preparation Plan]")
    for cat, subfolders in CATEGORY_MAPPING.items():
        all_images = []
        samples_per_folder = TARGET_SAMPLES_PER_CATEGORY // len(subfolders)
        remainder = TARGET_SAMPLES_PER_CATEGORY % len(subfolders)

        for i, subfolder in enumerate(subfolders):
            folder_path = RAW_PHOTOS_DIR / subfolder
            if not folder_path.exists():
                print(f"  [Warning] Missing folder: {folder_path}")
                continue

            imgs = [f for f in folder_path.iterdir() if f.suffix.lower() in [".jpg", ".jpeg", ".png"]]
            num_to_take = samples_per_folder + (1 if i < remainder else 0)
            sampled = random.sample(imgs, min(len(imgs), num_to_take))
            all_images.extend(sampled)

        random.shuffle(all_images)
        n_total = len(all_images)
        n_train = int(n_total * TRAIN_RATIO)
        n_val = int(n_total * VAL_RATIO)

        train_imgs = all_images[:n_train]
        val_imgs = all_images[n_train:n_train + n_val]
        test_imgs = all_images[n_train + n_val:]

        for split_name, img_list in [("train", train_imgs), ("val", val_imgs), ("test", test_imgs)]:
            for img_path in img_list:
                dst = DATASET_OUT_DIR / split_name / cat / f"{img_path.parent.name}_{img_path.name}"
                shutil.copy2(img_path, dst)

        print(f"  Category '{cat}': Total {n_total} -> Train {len(train_imgs)}, Val {len(val_imgs)}, Test {len(test_imgs)}")

    print(f"\n[Success] Dataset prepared at: {DATASET_OUT_DIR}")


if __name__ == "__main__":
    prepare_dataset()
