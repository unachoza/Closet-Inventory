// Form state
const [type, setType] = React.useState("");
const [color, setColor] = React.useState("");
const [size, setSize] = React.useState("");
const [brand, setBrand] = React.useState("");
const [material, setMaterial] = React.useState("");
const [occasion, setOccasion] = React.useState("");
const [age, setAge] = React.useState("");
const [care, setCare] = React.useState("");

{
	/* STEP 1: TYPE */
}
// {step === 1 && (
//     <div className="mb-4">
//       <Label>Type</Label>
//       <Select
//         value={formData.type}
//         onValueChange={(val) => setFormData((p) => ({ ...p, type: val }))}
//       >
//         <SelectTrigger>
//           <SelectValue placeholder="Select clothing type" />
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value="tops">Tops</SelectItem>
//           <SelectItem value="bottoms">Bottoms</SelectItem>
//           <SelectItem value="dresses">Dresses</SelectItem>
//           <SelectItem value="coats">Coats</SelectItem>
//           <SelectItem value="sweaters">Sweaters</SelectItem>
//           <SelectItem value="lingerie">Lingerie</SelectItem>
//           <SelectItem value="socks">Socks</SelectItem>
//           <SelectItem value="underwear">Underwear</SelectItem>
//         </SelectContent>
//       </Select>
//     </div>
//   )}
