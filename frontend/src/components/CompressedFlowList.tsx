import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGetFlagRegexQuery, useGetFlowQuery } from "../api";
import { highlightText } from "./flow_components/HighlightText";
import { TEXT_FILTER_KEY } from "../const";
import { FlowData } from "../types";
import { Buffer } from "buffer";

function TextFlow({ flow }: { flow: FlowData }) {
  let [searchParams] = useSearchParams();
  const text_filter = searchParams.get(TEXT_FILTER_KEY);
  const { data: flag_regex } = useGetFlagRegexQuery();
  const fromBase64 = Buffer.from(flow.b64, 'base64').toString()
  const text = highlightText(fromBase64, text_filter ?? "", flag_regex ?? "");

  return <pre className={`inline leading-none	 ${flow.from == "s" ? "bg-green-200" : "bg-red-200"}`}>{fromBase64}</pre>;
}


export function CompressedFlowList() {
  let [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();

  const id = params.id;

  const {
    data: flow,
    isError,
    isLoading,
  } = useGetFlowQuery(id!, { skip: id === undefined });
  return (
    <div className="text-sm leading-none">
      {flow?.flow.map((flow_data, i, a) => {
        const delta_time = a[i].time - (a[i - 1]?.time ?? a[i].time);
        return (
          <TextFlow flow={flow_data}></TextFlow>
        );
      })}
    </div>
  )
}
