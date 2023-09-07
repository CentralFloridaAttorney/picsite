import asyncio
import json
import os
import random
import sys
import uuid
from datetime import datetime

import pandas as pd
import torch
from diffusers import StableDiffusionPipeline


class Imagine:
    """
    The Imagine class handles image generation based on textual prompts.
    """
    DEFAULT_DEVICE = "cuda"
    DEFAULT_MODEL_ID = "CompVis/stable-diffusion-v1-4"
    DEFAULT_PRETRAINED_OFFICE = "/home/overlordx/_models/stable_diffusion"

    def __init__(self, device=DEFAULT_DEVICE, model_id=DEFAULT_MODEL_ID):
        """
        Constructor for the Imagine class.

        Initializes an instance of the Imagine class by setting up paths, model, and pipeline configurations.

        Parameters:
        - device (str): Specifies the hardware where the model will be run. Default is a pre-defined constant 'DEFAULT_DEVICE'.
                        Typically, this is either 'cpu' or 'cuda' for GPU acceleration.
        - model_id (str): Identifier for the pre-trained model that is going to be used for image generation. Default is a
                          pre-defined constant 'DEFAULT_MODEL_ID'.

        Attributes:
        - device (str): Stores the hardware device setting.
        - model_id (str): Stores the identifier for the pre-trained model.
        - imagine_path (str): Absolute path where generated images will be saved.
        - pipe (StableDiffusionPipeline): Instance of the diffusion model pipeline used for image generation.
        - imagine_dbtool (ImagineDBTool): Instance of a database tool for saving image metadata.

        Example:
        >>> imagine = Imagine()
        """

        # Assigning device and model ID to instance variables for later use
        self.device = device
        self.model_id = model_id

        self.imagine_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend/public/imagine'))
        os.makedirs(self.imagine_path, exist_ok=True)

        # Initialize the diffusion pipeline for image generation from a pre-trained model
        self.pipe = StableDiffusionPipeline.from_pretrained(pretrained_model_name_or_path=self.model_id)
        self.pipe.safety_checker = None
        self.pipe = self.pipe.to(self.device)

        # Initialize database tool for image metadata storage
        # self.imagine_dbtool = ImagineDBTool()

    def _get_generator(self, seed):
        """
        Create a new generator based on the seed.
        """
        return torch.Generator(device=self.device).manual_seed(seed)

    async def generate_images(self, seed=-1, prompt="a photograph of a cute puppy", file_identifier="puppy", height=312,
                              width=312, inference_steps=50, prompt_strength=10.0, multiple=False,
                              collection_name="imagetool"):
        """
        Generates one or more images based on provided parameters and returns metadata.

        Parameters:
        - seed (int): The random seed for image generation. Default is -1, which means a random seed will be generated.
        - prompt (str): Textual description to guide the image generation. Default is "a photograph of a cute puppy".
        - file_identifier (str): Identifier for the image files. Default is "puppy".
        - height (int): Height of the generated image in pixels. Default is 312.
        - width (int): Width of the generated image in pixels. Default is 312.
        - inference_steps (int): Number of inference steps for image generation. Default is 50.
        - prompt_strength (float): Strength of the guidance from the prompt. Default is 10.0.
        - multiple (bool): Whether to generate multiple images based on a list of styles. Default is False.
        - collection_name (str): Collection name for storing the images, not currently in use but reserved for future extension.

        Returns:
        - list: A list of json_data of the generated images.

        """

        torch.cuda.empty_cache()
        seed = random.randint(0, sys.maxsize) if seed == -1 else seed
        generator = self._get_generator(seed)
        images_json = []

        if multiple:
            styles = pd.read_csv("./styles/artist_styles").fillna("professional")
            for row_num, row in styles.iterrows():
                new_part = ", in the style of " + ", in the style of ".join(row)
                full_prompt = prompt + new_part
                json_data = self._generate_image(seed, full_prompt, file_identifier, height, width,
                                                 inference_steps, prompt_strength, generator)
                images_json.append(json_data)
        else:
            json_data = self._generate_image(seed, prompt, file_identifier, height, width, inference_steps,
                                             prompt_strength, generator)
            images_json.append(json_data)

        return images_json

    async def generate_image(self):
        output = await self.generate_images(prompt="a photograph of a cute puppy", height=256, width=256,
                                            inference_steps=10)
        assert isinstance(output, list) and len(output) == 1
        return output

    def _generate_image(self, seed, prompt, file_identifier, height, width, inference_steps, prompt_strength,
                        generator):
        """
        Internal method to generate a single image and save it both physically and in metadata.

        This function is called by `generate_images` to handle the core logic of image generation for each individual image.

        Parameters are same as those in `generate_images`.

        Returns:
        - str: The file path where the generated image is saved.

        Note: This is an internal method and generally should not be called directly.
        """

        image = self.pipe(
            prompt=prompt,
            generator=generator,
            height=height,
            width=width,
            num_inference_steps=inference_steps,
            guidance_scale=prompt_strength
        ).images[0]

        uuid_value = str(uuid.uuid4())
        image_path = os.path.join(self.imagine_path, f"{uuid_value}.png")
        image.save(image_path)

        json_data = self._get_json(seed, prompt, file_identifier, height, width,
                                   inference_steps, prompt_strength, uuid_value)

        # self.imagine_dbtool.open_table("images")
        # self.imagine_dbtool.json2dbtool(primary_key_name="primary_key", json_data=json_data)
        return json_data

    def _get_json(self, seed, prompt, file_identifier, height, width, inference_steps, prompt_strength, uuid_value):
        """
        Internal method to create a JSON object containing metadata for a generated image.

        This function is called internally by `_generate_image` to assemble all the metadata related to the image generation process. The metadata is later saved to the database.

        Parameters:
        - seed (int): The random seed used for generating the image.
        - prompt (str): The textual description that guided the image generation.
        - file_identifier (str): An identifier for the image files.
        - height (int): The height of the generated image in pixels.
        - width (int): The width of the generated image in pixels.
        - inference_steps (int): The number of inference steps used in the image generation process.
        - prompt_strength (float): The strength of the guidance from the prompt.
        - uuid_value (str): The UUID associated with the generated image.

        Returns:
        - dict: A dictionary containing all the specified metadata.

        Note: This is an internal method and generally should not be called directly.

        Example:
        >>> self._get_json(seed=42, prompt="a sunset over a mountain", file_identifier="sunset_mountain", height=312, width=312, inference_steps=50, prompt_strength=10.0, uuid_value="12345678-1234-5678-1234-567812345678")
        """

        json_data = {
            "seed": seed,
            "prompt": prompt,
            "file_identifier": file_identifier,
            "height": height,
            "width": width,
            "inference_steps": inference_steps,
            "prompt_strength": prompt_strength,
            "base_path": "imagine/",
            "primary_key": uuid_value,
            "date_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        return json_data


async def test_init():
    imagine = Imagine()
    image_json = await imagine.generate_image()

    # Define the file path where you want to save the JSON data
    file_path = "image_data.json"

    # Serialize the JSON data to a string
    json_str = json.dumps(image_json, indent=4)

    # Write the JSON data to the file
    with open(file_path, "w+") as file:
        file.write(json_str)

    print(f"Image JSON saved to {file_path}")
    return image_json

if __name__ == "__main__":
    image_json = asyncio.run(test_init())  # This line runs your async function
    print(image_json)
    image_json = asyncio.run(Imagine().generate_image())
    print(image_json)
    image_json = asyncio.run(Imagine().generate_images())
    print(image_json)
