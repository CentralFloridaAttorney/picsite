# generate_image.py
import asyncio
import argparse
import json

from imagine import Imagine


async def generate_images(seed, prompt, file_identifier, height, width, inference_steps, prompt_strength, multiple):
    # Create an instance of the Imagine class
    imagine = Imagine()

    # Call the generate_images function with the provided parameters
    image_json = await imagine.generate_images(
        seed=seed,
        prompt=prompt,
        file_identifier=file_identifier,
        height=height,
        width=width,
        inference_steps=inference_steps,
        prompt_strength=prompt_strength,
        multiple=multiple
    )
    image_json_str = json.dumps(image_json)
    return image_json_str


def main():
    parser = argparse.ArgumentParser(description='Generate images using Imagine')
    parser.add_argument('--seed', type=int, default=-1, help='Seed value')
    parser.add_argument('--prompt', type=str, default='a photograph of a cute puppy', help='Prompt text')
    parser.add_argument('--file_identifier', type=str, default='puppy', help='File identifier')
    parser.add_argument('--height', type=int, default=312, help='Image height')
    parser.add_argument('--width', type=int, default=312, help='Image width')
    parser.add_argument('--inference_steps', type=int, default=50, help='Inference steps')
    parser.add_argument('--prompt_strength', type=float, default=10.0, help='Prompt strength')
    parser.add_argument('--multiple', type=bool, default=False, help='Generate multiple images')
    args = parser.parse_args()

    # Call the generate_images function with the parsed arguments
    image_json = asyncio.run(generate_images(
        args.seed,
        args.prompt,
        args.file_identifier,
        args.height,
        args.width,
        args.inference_steps,
        args.prompt_strength,
        args.multiple
    ))

    print(image_json)


if __name__ == "__main__":
    main()
